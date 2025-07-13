const TranslationModel = require("../models/translationModel");
const model = new TranslationModel();

async function updateLanguagePreference(req, res) {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const { userId, language } = req.body;
    
    if (!userId || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    console.log(`Attempting to update user ${userId} to language ${language}`);
    
    const success = await model.updateLanguagePreference(parseInt(userId), language);
    
    if (!success) {
      console.error('Update failed - user not found or no rows affected');
      return res.status(404).json({ error: "User not found or update failed" });
    }
    
    console.log('Language preference updated successfully');
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