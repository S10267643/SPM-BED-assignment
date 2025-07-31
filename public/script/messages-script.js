document.addEventListener('DOMContentLoaded', async function() {
    // Verify user data exists
    const currentUser = {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('role')
    };

    if (!currentUser.id || !currentUser.role) {
        console.error('User data not found in localStorage');
        return;
    }

    console.log('Initializing messaging for:', currentUser.role);
    
    // Initialize based on role
    if (currentUser.role === 'Caregiver') {
        initializeCaregiverInterface();
    } else if (currentUser.role === 'Elderly') {
        initializeElderlyInterface();
    }

    // ======================
    // CAREGIVER INTERFACE
    // ======================
    async function initializeCaregiverInterface() {
        const messageInbox = document.getElementById('messageInbox');
        const caregiverInboxSection = document.getElementById('caregiverInboxSection');
        
        if (!messageInbox || !caregiverInboxSection) {
            console.log('Caregiver interface elements not found');
            return;
        }

        // Show loading state
        messageInbox.innerHTML = '<div class="no-messages" data-translate="loading_messages">Loading messages...</div>';
        
        // Make sure section is visible
        caregiverInboxSection.style.display = 'block';
        
        // Load messages after a slight delay to ensure DOM is ready
        setTimeout(() => loadMessageInbox(), 100);
    }

    async function loadMessageInbox() {
        try {
            const response = await fetch(`/api/messages/caregiver?caregiverId=${currentUser.id}`);
            if (!response.ok) throw new Error('Failed to load messages');
            
            const messages = await response.json();
            
            if (messages.length === 0) {
                document.getElementById('messageInbox').innerHTML = 
                    '<div class="no-messages" data-translate="no_messages">No messages yet</div>';
            } else {
                renderMessageInbox(messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            document.getElementById('messageInbox').innerHTML = 
                '<div class="no-messages" data-translate="error_loading_messages">Error loading messages</div>';
        }
    }

        function renderMessageInbox(messages) {
        messageInbox.innerHTML = messages.length ? '' : '<div class="no-messages">No messages</div>';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'inbox-message';
            messageDiv.innerHTML = `
                <div class="inbox-message-header">
                    <span class="inbox-sender">${msg.elderlyName}</span>
                    <span class="inbox-time">${formatTimestamp(msg.timestamp)}</span>
                </div>
                <div class="inbox-content">${msg.message}</div>
                <button class="mark-read-btn" data-message-id="${msg.messageId}" data-translate="mark_as_read">Mark as Read</button>
            `;
            messageDiv.onclick = (e) => {
                // Only view conversation if the click wasn't on the mark as read button
                if (!e.target.classList.contains('mark-read-btn')) {
                    viewConversation(msg.elderlyId);
                }
            };
            messageInbox.appendChild(messageDiv);
        });

        // Add event listeners to all mark as read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', handleMarkAsRead);
        });
    }

    async function handleMarkAsRead(e) {
        e.stopPropagation(); // Prevent the parent div's click handler from firing
        const messageId = e.target.dataset.messageId;
        
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to mark message as read');
            
            // Reload the inbox after successful deletion
            loadMessageInbox();
        } catch (error) {
            console.error('Error marking message as read:', error);
            alert('Failed to mark message as read. Please try again.');
        }
    }
    

    // ======================
    // ELDERLY INTERFACE
    // ======================
    function initializeElderlyInterface() {
        const caregiverDropdown = document.getElementById('caregiverDropdown');
        const confirmCheckbox = document.getElementById('confirmCaregiver');
        const messageArea = document.getElementById('messageArea');
        const conversationContainer = document.getElementById('conversationContainer');
        
        // Only proceed if we have the required elements
        if (!caregiverDropdown || !confirmCheckbox || !messageArea || !conversationContainer) {
            console.log('Elderly interface elements not found - may be on wrong page');
            return;
        }

        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');

        // Load caregivers dropdown
        loadCaregivers();

        // Setup event listeners
        confirmCheckbox.addEventListener('change', toggleMessageArea);
        caregiverDropdown.addEventListener('change', handleCaregiverChange);
        if (sendButton) sendButton.addEventListener('click', sendMessage);

        async function loadCaregivers() {
            try {
                const response = await fetch('/users?role=Caregiver');
                const caregivers = await response.json();
                
                caregiverDropdown.innerHTML = '<option value="">-- Select --</option>';
                caregivers.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.userId;
                    option.textContent = c.name;
                    caregiverDropdown.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading caregivers:', error);
            }
        }

        function toggleMessageArea() {
            messageArea.classList.toggle('hidden', !this.checked);
            if (this.checked && caregiverDropdown.value) {
                loadConversation(currentUser.id, caregiverDropdown.value);
            }
        }

        function handleCaregiverChange() {
            if (confirmCheckbox.checked && this.value) {
                loadConversation(currentUser.id, this.value);
            }
        }

        async function sendMessage() {
            const messageText = messageInput.value.trim();
            if (!messageText || !caregiverDropdown.value) return;
            
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
            }
        }
    }

    // ======================
    // SHARED FUNCTIONS
    // ======================
    async function loadConversation(elderlyId, caregiverId) {
        const conversationContainer = document.getElementById('conversationContainer');
        if (!conversationContainer) return;
        
        try {
            const response = await fetch(`/api/messages/conversation/${elderlyId}/${caregiverId}`);
            if (!response.ok) throw new Error('Failed to load conversation');
            
            const messages = await response.json();
            renderConversation(messages);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    }

    function renderConversation(messages) {
        const container = document.getElementById('conversationContainer');
        if (!container) return;
        
        container.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.dataset.messageId = msg.messageId;
            messageDiv.dataset.messageContent = msg.message;
            
            const isFromCurrentUser = msg.elderlyId == currentUser.id;
            const editBtn = isFromCurrentUser 
                ? `<button class="edit-msg-btn" data-message-id="${msg.messageId}">✏️</button>`
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
            
            container.appendChild(messageDiv);
        });

        document.querySelectorAll('.edit-msg-btn').forEach(btn => {
            btn.addEventListener('click', handleEditMessage);
        });
        
        container.scrollTop = container.scrollHeight;
    }

    async function viewConversation(elderlyId) {
        const conversationContainer = document.getElementById('conversationContainer');
        if (!conversationContainer) return;
        
        try {
            const response = await fetch(`/api/messages/conversation/${elderlyId}/${currentUser.id}`);
            if (!response.ok) throw new Error('Failed to load conversation');
            
            const messages = await response.json();
            renderConversation(messages);
            conversationContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    }

    async function handleEditMessage(e) {
        const messageId = e.target.dataset.messageId;
        const messageDiv = e.target.closest('.message');
        const currentText = messageDiv.dataset.messageContent;
        
        messageDiv.innerHTML = `
            <div class="edit-container">
                <strong>${currentUser.name || 'You'}:</strong>
                <input type="text" value="${currentText}" class="edit-input">
                <div class="edit-actions">
                    <button class="save-edit" data-translate="save">Save</button>
                    <button class="cancel-edit" data-translate="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        messageDiv.querySelector('.edit-input').focus();
        
        messageDiv.querySelector('.save-edit').addEventListener('click', async () => {
            const newText = messageDiv.querySelector('.edit-input').value.trim();
            if (newText && newText !== currentText) {
                try {
                    const response = await fetch(`/api/messages/${messageId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: newText })
                    });
                    
                    if (!response.ok) throw new Error('Failed to update message');
                    
                    const caregiverDropdown = document.getElementById('caregiverDropdown');
                    if (caregiverDropdown && caregiverDropdown.value) {
                        loadConversation(currentUser.id, caregiverDropdown.value);
                    }
                } catch (error) {
                    console.error('Error updating message:', error);
                }
            }
        });
        
        messageDiv.querySelector('.cancel-edit').addEventListener('click', () => {
            const caregiverDropdown = document.getElementById('caregiverDropdown');
            if (caregiverDropdown && caregiverDropdown.value) {
                loadConversation(currentUser.id, caregiverDropdown.value);
            }
        });
    }

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
});