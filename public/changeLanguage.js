// Set active button on page load
document.addEventListener('DOMContentLoaded', () => {
  const currentLang = localStorage.getItem('language') || 'en';
  setActiveButton(currentLang);
});

// Button click handler
document.querySelectorAll('.language-button').forEach(button => {
  button.addEventListener('click', async () => {
    const lang = button.dataset.lang;
    setActiveButton(lang);
    localStorage.setItem('language', lang);
    
    try {
      const userId = getUserId(); // Your user ID logic
      const response = await fetch('/api/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, language: lang })
      });
      
      if (!response.ok) throw new Error('Update failed');
    } catch (error) {
      console.error('Error:', error);
      // Revert on error
      const defaultLang = 'en';
      setActiveButton(defaultLang);
      localStorage.setItem('language', defaultLang);
    }
  });
});

// Helper function to set active button
function setActiveButton(lang) {
  document.querySelectorAll('.language-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}