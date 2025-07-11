const TranslationModel = require("../models/translationModel");
const model = new TranslationModel();

async function updateLanguagePreference(req, res) {
  try {
    const { userId, language } = req.body;
    
    if (!['en', 'zh'].includes(language)) {
      return res.status(400).json({ error: "Invalid language code" });
    }

    const success = await model.updateLanguagePreference(userId, language);
    
    if (!success) return res.status(404).json({ error: "User not found" });
    
    res.json({ 
      success: true,
      newLanguage: language
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getTranslations(req, res) {
  try {
    const { lang } = req.query; // Get language from query parameter
    const translations = await model.getTranslations(lang || 'en');
    res.json(translations);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get translations" });
  }
}

module.exports = { 
  updateLanguagePreference,
  getTranslations
};