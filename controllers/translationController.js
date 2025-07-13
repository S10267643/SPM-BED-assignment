const TranslationModel = require("../models/translationModel");
const model = new TranslationModel();

async function updateLanguagePreference(req, res) {

  try {
    const { userId, language } = req.body;
    
    if (!userId || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    
    const success = await model.updateLanguagePreference(parseInt(userId), language);
    
    if (!success) {
      return res.status(404).json({ error: "User not found or update failed" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getTranslations(req, res) {
  try {
    const { lang } = req.query;
    
    // Accept both full names and codes
    const validLanguages = {
      'English': 'English',
      'Chinese': 'Chinese',
      'en': 'English',
      'zh': 'Chinese'
    };
    
    if (!validLanguages[lang]) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const translations = await model.getTranslations(validLanguages[lang]);
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