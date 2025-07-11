const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class TranslationModel {
  constructor() {
    // Initialize Google Cloud Translation client
    this.translationClient = new TranslationServiceClient();
    this.projectId = 'your-google-cloud-project-id'; // Replace with your actual project ID
    this.location = 'global'; // Or your preferred location
  }

  /**
   * Updates user's preferred language in database
   * @param {number} userId 
   * @param {string} language (en|zh)
   * @returns {Promise<boolean>}
   */
  async updateLanguagePreference(userId, language) {
    let pool;
    try {
      if (!['en', 'zh'].includes(language)) {
        throw new Error('Invalid language code');
      }

      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('language', sql.NVarChar(2), language)
        .query(`
          UPDATE users 
          SET preferred_language = @language 
          WHERE user_id = @userId
        `);
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    } finally {
      if (pool) await pool.close();
    }
  }

  /**
   * Gets translations for a specific language
   * @param {string} targetLang - Target language code (e.g., 'en', 'zh')
   * @returns {Promise<Object>} Translation key-value pairs
   */
  async getTranslations(targetLang = 'en') {
    // Define your source strings (could also be stored in a database)
    const sourceStrings = {
      welcome: "Welcome",
      changeLanguage: "Change Language",
      back: "←",
      english: "English",
      chinese: "Chinese"
    };

    try {
      // Prepare the translation request
      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: Object.values(sourceStrings),
        mimeType: 'text/plain',
        sourceLanguageCode: 'en', // Assuming source is English
        targetLanguageCode: targetLang,
      };

      // Call the Translation API
      const [response] = await this.translationClient.translateText(request);

      // Map the translations back to the original keys
      const translations = {};
      let i = 0;
      for (const key in sourceStrings) {
        translations[key] = response.translations[i].translatedText;
        i++;
      }

      return translations;
    } catch (error) {
      console.error('Translation API error:', error);
      throw error;
    }
  }
}

module.exports = TranslationModel;