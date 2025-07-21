document.getElementById('addContactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const contactData = {
      contactName: document.getElementById('name').value.trim(),
      phoneNumber: document.getElementById('phone').value.replace(/\D/g, ''),
      relationship: document.getElementById('relationship').value,
    };

    // Basic validation
    if (!contactData.contactName || !contactData.phoneNumber) {
      throw new Error('Please fill all required fields');
    }

    const phone = contactData.phoneNumber;

    if (!/^[89]\d{7}$/.test(phone)) {
      throw new Error('Phone number must be 8 digits and start with 8 or 9');
    }

    const response = await fetch('http://localhost:3000/api/emergency-contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(contactData)
    });

    // First check if response is HTML
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const html = await response.text();
      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }


    alert('Contact created successfully!');
    window.location.href = 'emergencyContact.html';
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
});