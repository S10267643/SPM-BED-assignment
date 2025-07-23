document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const caregiverDropdown = document.getElementById('caregiverDropdown');
    const confirmCheckbox = document.getElementById('confirmCaregiver');
    const messageArea = document.getElementById('messageArea');
    const conversationContainer = document.getElementById('conversationContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Current user (elderly) - retrieved from localStorage
    const currentUser = {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'), 
        role: localStorage.getItem('userRole') || 'Elderly'
    };

    // Load caregivers into dropdown
    async function loadCaregivers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required. Please log in.');
        }

        const response = await fetch('/users?role=Caregiver', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // First check if we got an HTML error page
        const responseText = await response.text();
        if (responseText.startsWith('<!DOCTYPE')) {
            throw new Error('Server returned HTML error page. Check backend implementation.');
        }

        // Now try to parse as JSON
        const caregivers = JSON.parse(responseText);
        
        caregiverDropdown.innerHTML = '<option value="">-- Select a Caregiver --</option>';
        
        caregivers.forEach(caregiver => {
            const option = document.createElement('option');
            option.value = caregiver.userId;
            option.textContent = caregiver.name;
            caregiverDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading caregivers:', error);
        alert(error.message || 'Failed to load caregivers. Please try again.');
        
        if (error.message.includes('authentication') || error.message.includes('log in')) {
            window.location.href = '/login';
        }
    }
    }

    // Toggle message area based on checkbox
    confirmCheckbox.addEventListener('change', function() {
        messageArea.classList.toggle('hidden', !this.checked);
        if (this.checked && caregiverDropdown.value) {
            loadConversation(currentUser.id, caregiverDropdown.value);
        }
    });

    // Load conversation when caregiver is selected
    caregiverDropdown.addEventListener('change', function() {
        if (confirmCheckbox.checked && this.value) {
            loadConversation(currentUser.id, this.value);
        }
    });

    // Load conversation between elderly and caregiver
    async function loadConversation(elderlyId, caregiverId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages/conversation/${elderlyId}/${caregiverId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load conversation');
            
            const messages = await response.json();
            renderConversation(messages);
        } catch (error) {
            console.error('Error loading conversation:', error);
            alert('Failed to load messages. Please try again.');
        }
    }

    // Render conversation messages
    function renderConversation(messages) {
        conversationContainer.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.dataset.messageId = msg.messageId;
            messageDiv.dataset.messageContent = msg.message; // Store raw message separately
            
            const isFromCurrentUser = msg.elderlyId == currentUser.id;
            const editBtn = isFromCurrentUser 
                ? `<button class="edit-btn" data-message-id="${msg.messageId}">✏️</button>`
                : '';
            
            if (isFromCurrentUser) {
                messageDiv.classList.add('sent');
                messageDiv.innerHTML = `
                    <div class="message-content">
                        <strong>${currentUser.name || 'You'}:</strong> 
                        <span class="message-text">${msg.message}</span>
                    </div>
                    <div class="message-actions">
                        ${editBtn}
                        <div class="message-timestamp">${formatTimestamp(msg.timestamp)}</div>
                    </div>
                `;
            } else {
                messageDiv.classList.add('received');
                messageDiv.innerHTML = `
                    <div><strong>${msg.caregiverName || 'Caregiver'}:</strong> ${msg.message}</div>
                    <div class="message-timestamp">${formatTimestamp(msg.timestamp)}</div>
                `;
            }
            
            conversationContainer.appendChild(messageDiv);
        });

        // Add edit handlers
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditMessage);
        });
        
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }

    async function handleEditMessage(e) {
        const messageId = e.target.dataset.messageId;
        const messageDiv = e.target.closest('.message');
        // Get the raw message content from dataset instead of parsing HTML
        const currentText = messageDiv.dataset.messageContent;
        
        // Replace with editable input (without username)
        messageDiv.innerHTML = `
            <div class="edit-container">
                <strong>${currentUser.name || 'You'}:</strong>
                <input type="text" value="${currentText}" class="edit-input">
                <div class="edit-actions">
                    <button class="save-edit">Save</button>
                    <button class="cancel-edit">Cancel</button>
                </div>
            </div>
        `;
        
        messageDiv.querySelector('.edit-input').focus();
        
        // Handle save
        messageDiv.querySelector('.save-edit').addEventListener('click', async () => {
            const newText = messageDiv.querySelector('.edit-input').value.trim();
            if (newText && newText !== currentText) {
                try {
                    const response = await fetch(`/api/messages/${messageId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ message: newText })
                    });
                    
                    if (!response.ok) throw new Error('Failed to update message');
                    
                    // Refresh conversation after edit
                    loadConversation(currentUser.id, caregiverDropdown.value);
                } catch (error) {
                    console.error('Error updating message:', error);
                    alert('Failed to update message');
                }
            }
        });
        
        // Handle cancel
        messageDiv.querySelector('.cancel-edit').addEventListener('click', () => {
            loadConversation(currentUser.id, caregiverDropdown.value);
        });
    }

    // Format timestamp to show exact UTC time from database
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`; 
    }

    // Send message
    sendButton.addEventListener('click', async function() {
        const messageText = messageInput.value.trim();
        if (!messageText || !caregiverDropdown.value) return;
        
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    elderlyId: currentUser.id,
                    caregiverId: caregiverDropdown.value,
                    message: messageText
                })
            });
            
            if (!response.ok) throw new Error('Failed to send message');
            
            messageInput.value = '';
            loadConversation(currentUser.id, caregiverDropdown.value);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    });

    // Initial load
    loadCaregivers();
});