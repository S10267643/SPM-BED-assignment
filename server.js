// Note: This js file is for translations 

const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;
const translationClient = new TranslationServiceClient();

// Replace with your actual project ID
const projectId = 'crucial-garden-465606-b9'; 
const location = 'global';

async function translateText(text, targetLanguage) {
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: 'en',
    targetLanguageCode: targetLanguage,
  };

  const [response] = await translationClient.translateText(request);
  return response.translations[0].translatedText;
}

// In server.js, update the /api/translations endpoint:
app.get('/api/translations', async (req, res) => {
  const lang = req.query.lang || 'en';
  
  // Base English translations
  const sourceTranslations = {
    back: "←",
    changeLanguage: "Change Language",
    english: "English",
    chinese: "Chinese",
    title: "DailyDose"
  };

  // If English requested, return directly
  if (lang === 'en') {
    return res.json(sourceTranslations);
  }

  try {
    // For Chinese, use our predefined translations
    if (lang === 'zh') {
      return res.json({
        back: "←",
        changeLanguage: "更改语言",
        english: "英语",
        chinese: "简体中文",
        title: "每日剂量"
      });
    }
    
    // For other languages, you could implement translation here
    return res.status(400).json({ error: 'Unsupported language' });
    
  } catch (error) {
    console.error('Translation failed:', error);
    res.status(500).json({ error: 'Translation service unavailable' });
  }
});

// Add proper user authentication check
app.post('/api/update-language', (req, res) => {
  const { userId, language } = req.body;
  
  // 1. Validate input
  if (!userId || !['en', 'zh'].includes(language)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // 2. Add your actual user verification logic
  // This depends on your auth system - examples:
  
  // If using sessions:
  // if (!req.session.user || req.session.user.id !== userId) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  
  // If using JWT:
  // try {
  //   const token = req.headers.authorization.split(' ')[1];
  //   const decoded = jwt.verify(token, 'your-secret-key');
  //   if (decoded.userId !== userId) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }
  // } catch (err) {
  //   return res.status(401).json({ error: 'Invalid token' });
  // }
  
  // 3. Mock database update (replace with your actual DB code)
  console.log(`Updating language for user ${userId} to ${language}`);
  
  // 4. Return success
  res.json({ 
    success: true,
    message: `Language updated to ${language}`
  });
});