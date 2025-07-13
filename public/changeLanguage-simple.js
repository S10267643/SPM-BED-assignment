// SIMPLE VERSION - Just handles language switching
let currentLanguage = localStorage.getItem('language') || 'en';

async function loadTranslations(lang) {
  try {
    const response = await fetch(`/api/translations?lang=${lang}`);
    const translations = await response.json();
    
    // Apply translations to the page
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (translations[key]) el.textContent = translations[key];
    });
  } catch (error) {
    console.error("Translation error:", error);
  }
}

async function changeLanguage(newLang) {
  try {
    // Update UI immediately
    localStorage.setItem('language', newLang);
    await loadTranslations(newLang === 'zh' ? 'Chinese' : 'English'); // Convert to full name for translation loading
    
    // Get and validate user ID
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log("No user logged in - skipping server update");
      return;
    }
    
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      throw new Error("Invalid user ID format");
    }

    const response = await fetch('/api/update-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: numericUserId, 
        language: newLang // Send the code directly
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update language");
    }
    
    console.log("Language preference updated successfully");
  } catch (error) {
    console.error("Language change error:", error);
    alert(`Error: ${error.message}`);
    // Revert to previous language
    await loadTranslations(localStorage.getItem('language') === 'zh' ? 'Chinese' : 'English');
  }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set up buttons
  document.querySelectorAll('.language-button').forEach(button => {
    button.addEventListener('click', () => {
      changeLanguage(button.dataset.lang);
      button.classList.add('active');
    });
  });
  
  // Load current language
  loadTranslations(currentLanguage);
});