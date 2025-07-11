// Initialize with default language
let currentLanguage = localStorage.getItem('language') || 'en';

// DOM Content Loaded handler
document.addEventListener('DOMContentLoaded', async () => {
    // Load translations and apply them
    await loadTranslations(currentLanguage);
    
    // Set active button
    setActiveButton(currentLanguage);
    
    // Set up event listeners
    setupLanguageButtons();
});

// Add this temporary debug code to your button click handler
document.querySelectorAll('.language-button').forEach(button => {
  button.addEventListener('click', (e) => {
    console.log('Button clicked! Language:', e.currentTarget.dataset.lang);
    // ... rest of your code
  });
});

// Setup language button event listeners
function setupLanguageButtons() {
    document.querySelectorAll('.language-button').forEach(button => {
        button.addEventListener('click', async () => {
            const newLang = button.dataset.lang;
            if (newLang !== currentLanguage) {
                await changeLanguage(newLang);
            }
        });
    });
}

// Main function to change language
async function changeLanguage(newLang) {
    try {
        // 1. Update UI immediately for better responsiveness
        setActiveButton(newLang);
        
        // 2. Save to localStorage
        localStorage.setItem('language', newLang);
        
        // 3. Update in database via API
        const userId = getUserId(); // Implement your user ID retrieval
        const response = await fetch('/api/update-language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, language: newLang })
        });
        
        if (!response.ok) throw new Error('Language update failed');
        
        // 4. Load and apply new translations
        await loadTranslations(newLang);
        currentLanguage = newLang;
        
    } catch (error) {
        console.error('Language change failed:', error);
        // Revert to previous language on error
        setActiveButton(currentLanguage);
        await loadTranslations(currentLanguage);
    }
}

// Apply translations to the page
function applyTranslations(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// Helper function to set active button
function setActiveButton(lang) {
    document.querySelectorAll('.language-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Helper function to get user ID (implement according to your auth system)
function getUserId() {
    // Example: return localStorage.getItem('userId');
    return 1; // Replace with actual user ID retrieval
}

// Temporary mock translations - remove after implementing real backend
const mockTranslations = {
  en: {
    back: "←",
    changeLanguage: "Change Language",
    english: "English",
    chinese: "Chinese",
    title: "DailyDose"
  },
  zh: {
    back: "←",
    changeLanguage: "更改语言",
    english: "英语",
    chinese: "简体中文",
    title: "每日剂量"
  }
};

async function loadTranslations(lang) {
  try {
    // Use mock data temporarily
    const translations = mockTranslations[lang] || mockTranslations.en;
    applyTranslations(translations);
    document.documentElement.lang = lang;
    
    console.log('Using mock translations for:', lang);
    
    /* Comment out the real API call for now
    const response = await fetch(`/api/translations?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to load translations');
    const translations = await response.json();
    applyTranslations(translations);
    */
    
  } catch (error) {
    console.error('Translation loading error:', error);
  }
}