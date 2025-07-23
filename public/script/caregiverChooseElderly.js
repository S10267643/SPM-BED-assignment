
    document.getElementById("currentDate").textContent = new Date().toLocaleDateString('en-SG', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });