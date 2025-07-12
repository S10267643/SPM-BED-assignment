let currentLanguage = localStorage.getItem('language') || 'English';

document.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations(currentLanguage);
    setActiveButton(currentLanguage);
    setupLanguageButtons();
});

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

async function changeLanguage(newLang) {
    try {
        setActiveButton(newLang);
        localStorage.setItem('language', newLang);
        
        // Remove user ID requirement for pre-login pages
        if (getUserId()) {  // Only send update if user is logged in
            const response = await fetch('/api/update-language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: getUserId(), language: newLang })
            });
            if (!response.ok) throw new Error('Language update failed');
        }
        
        await loadTranslations(newLang);
        currentLanguage = newLang;
    } catch (error) {
        console.error('Language change failed:', error);
        setActiveButton(currentLanguage);
        await loadTranslations(currentLanguage);
    }
}
function applyTranslations(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

function setActiveButton(lang) {
    document.querySelectorAll('.language-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function getUserId() {
    // Implement according to your auth system
    return 1;
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`/api/translations?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to load translations');
    
    const translations = await response.json();
    applyTranslations(translations);
    document.documentElement.lang = lang;
  } catch (error) {
    console.error('Translation loading error:', error);
    if (lang !== 'English') await loadTranslations('English');
  }
}