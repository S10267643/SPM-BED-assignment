// Language management
let currentLanguage = localStorage.getItem('language') || 'en';

// Load translations from server
async function loadTranslations(lang) {
  try {
    // Normalize the input language first
    const normalizedLang = lang === 'Chinese' ? 'zh' : 
                         lang === 'English' ? 'en' : 
                         lang; // fallback to whatever was passed
    
    // Convert to API-expected format (full names)
    const apiLang = normalizedLang === 'zh' ? 'Chinese' : 'English';
    
    console.log(`Normalized lang: ${normalizedLang}, API lang: ${apiLang}`);
    
    const response = await fetch(`/api/translations?lang=${apiLang}`);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const translations = await response.json();
    applyTranslations(translations);
    
    // Set HTML lang attribute using normalized code
    document.documentElement.lang = normalizedLang;
    
  } catch (error) {
    console.error('Translation loading error:', error);
    // Fallback to English
    await loadTranslations('en');
  }
}

// Apply translations to DOM
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

// Main language change function
async function changeLanguage(newLang) {
  try {
    // 1. Normalize language input
    const normalizedLang = newLang === 'Chinese' ? 'zh' : 
                         newLang === 'English' ? 'en' : 
                         newLang;

    console.log('Changing to:', normalizedLang);
    
    // 2. Update UI immediately
    localStorage.setItem('language', normalizedLang);
    await loadTranslations(normalizedLang);
    
    // 3. Get authentication data with validation
    const authData = {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId')
    };
    
    console.log('Auth data:', authData);
    
    if (!authData.token || !authData.userId) {
      console.warn('User not authenticated - UI language changed but not saved to server');
      return;
    }
    
    // 4. Update server preference
    console.log('Updating server language preference...');
    const response = await fetch('/api/update-language', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({ 
        userId: parseInt(authData.userId),
        language: normalizedLang
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Language update failed');
    }
    
    console.log('Language preference updated on server');
    
  } catch (error) {
    console.error('Language change error:', error.message);
    // Revert to previous language on failure
    const fallbackLang = localStorage.getItem('language') || 'en';
    await loadTranslations(fallbackLang);
  }
}

// Set active language button
function setActiveButton(lang) {
  document.querySelectorAll('.language-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Get stored language or default to English
  let storedLang = localStorage.getItem('language');
  
  // Normalize stored value
  if (storedLang === 'Chinese') storedLang = 'zh';
  if (storedLang === 'English' || !storedLang) storedLang = 'en';
  
  console.log('Initial language load:', storedLang);
  await loadTranslations(storedLang);

  const initialLoadLang = storedLang === 'zh' ? 'Chinese' : 'English';
  
  await loadTranslations(initialLoadLang);
  // Load current language
  await loadTranslations(currentLanguage);
  
  // Set up language buttons
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