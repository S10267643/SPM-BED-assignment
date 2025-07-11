let currentLanguage = localStorage.getItem('language') || 'en';

async function loadTranslations(lang) {
  try {
    const response = await fetch(`/api/translations?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to load translations');
    
    const translations = await response.json();
    applyTranslations(translations);
    document.documentElement.lang = lang;
    currentLanguage = lang;
    
  } catch (error) {
    console.error('Translation loading error:', error);
    if (lang !== 'en') await loadTranslations('en'); // Fallback to English
  }
}

function applyTranslations(translations) {
  // Priority 1: Explicit data-translate items
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[key]) el.textContent = translations[key];
  });

  // Priority 2: Auto-translate by element ID
  document.querySelectorAll('[id]').forEach(el => {
    if (translations[el.id] && !el.hasAttribute('data-translate')) {
      el.textContent = translations[el.id];
    }
  });

  // Priority 3: Common UI patterns
  const buttons = translations.buttons || {};
  document.querySelectorAll('button').forEach(btn => {
    const key = btn.id || btn.textContent.trim().toLowerCase().replace(/\s+/g, '_');
    if (buttons[key]) btn.textContent = buttons[key];
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage);
});

function getUserId() {
  // Method 1: Check if using session-based auth
  if (window.currentUser && window.currentUser.id) {
    return window.currentUser.id;
  }
  
  // Method 2: Get from localStorage (if you store it there after login)
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData).id;
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }
  
  // Method 3: Get from cookies (if using cookie-based auth)
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('user_id='))
    ?.split('=')[1];
    
  return cookieValue || null;
}

// Make available for manual language changes
window.changeLanguage = async (newLang) => {
  if (newLang !== currentLanguage) {
    const userId = getUserId();
    
    if (!userId) {
      console.error('No user ID found - cannot save language preference');
      // Optionally redirect to login
      // window.location.href = '/login.html';
      return;
    }
    
    localStorage.setItem('language', newLang);
    await loadTranslations(newLang);
    
    try {
      const response = await fetch('/api/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, language: newLang })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update language');
      }
      
    } catch (error) {
      console.error('Language update failed:', error);
    }
  }
};

async function translateAllTextNodes(lang) {
  if (lang === 'en') return; // skip if English

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip empty or whitespace-only nodes
        return /\S/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    },
    false
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  const texts = textNodes.map(n => n.nodeValue.trim());

  try {
    const response = await fetch(`/api/translate-batch?lang=${lang}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts })
    });

    const { translations } = await response.json();

    textNodes.forEach((node, i) => {
      node.nodeValue = translations[i];
    });
  } catch (err) {
    console.error('Batch translation failed:', err);
  }
}
