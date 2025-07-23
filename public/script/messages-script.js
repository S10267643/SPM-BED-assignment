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
        role: localStorage.getItem('userRole') || 'Elderly'
    };

    // Load caregivers into dropdown
    async function loadCaregivers() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }

            const response = await fetch('/api/users?role=Caregiver', { // Changed endpoint
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch caregivers');
            }
            
            const caregivers = await response.json();
            caregiverDropdown.innerHTML = '<option value="">-- Select a Caregiver --</option>';
            
            caregivers.forEach(caregiver => {
                const option = document.createElement('option');
                option.value = caregiver.userId;  // Matches your userModel structure
                option.textContent = caregiver.name; // Using name from userModel
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
            
            // Determine if message is sent or received
            if (msg.elderlyId === currentUser.id) {
                messageDiv.classList.add('sent');
                messageDiv.innerHTML = `
                    <div>${msg.message}</div>
                    <div class="message-timestamp">${formatTimestamp(msg.timestamp)}</div>
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
        
        // Scroll to bottom
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }

    // Format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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