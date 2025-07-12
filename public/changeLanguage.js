// changeLanguage.js - Updated Version
let currentLanguage = localStorage.getItem('language') || 'English';

// Shared translation functions
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/api/translations?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to load translations');
    
    const translations = await response.json();
    applyTranslations(translations);
    document.documentElement.lang = lang === 'Chinese' ? 'zh' : 'en';
  } catch (error) {
    console.error('Translation loading error:', error);
    if (lang !== 'English') await loadTranslations('English');
  }
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[key]) {
      if (element.tagName === 'INPUT' && element.placeholder) {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
}

// Language change handler
async function changeLanguage(newLang) {
  try {
    localStorage.setItem('language', newLang);
    currentLanguage = newLang;
    
    // Update all open pages
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('language_channel');
      channel.postMessage({ type: 'LANGUAGE_CHANGE', language: newLang });
    }
    
    await loadTranslations(newLang);
    
    // For the language selection page
    if (document.querySelector('.language-buttons')) {
      setActiveButton(newLang);
    }
    
  } catch (error) {
    console.error('Language change failed:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load current language
  await loadTranslations(currentLanguage);
  
  // Set up language buttons if they exist
  if (document.querySelector('.language-buttons')) {
    setActiveButton(currentLanguage);
    document.querySelectorAll('.language-button').forEach(button => {
      button.addEventListener('click', () => changeLanguage(button.dataset.lang));
    });
  }
  
  // Listen for language changes from other tabs
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('language_channel');
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'LANGUAGE_CHANGE') {
        loadTranslations(event.data.language);
      }
    });
  }
});

// Helper functions
function setActiveButton(lang) {
  document.querySelectorAll('.language-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}