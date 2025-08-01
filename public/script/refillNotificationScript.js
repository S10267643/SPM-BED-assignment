// refillNotificationScript.js 
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    try {
        const response = await fetch(`/api/refill-check/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.message === "Refill notification sent.") {
            alert(" Reminder: You have a medication that is below the refill threshold. Please refill soon.");
        }
    } catch (err) {
        console.error("Error fetching refill status", err);
    }
});

