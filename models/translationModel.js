const sql = require("mssql");
const dbConfig = require("../dbConfig");

class TranslationModel {
  constructor() {
    // In-memory translations (replace with DB fetch if needed)
    this.translations = {
      en: {
        welcome: "Welcome",
        changeLanguage: "Change Language",
        back: "←",
        english: "English",
        chinese: "Chinese"
      },
      zh: {
        welcome: "欢迎",
        changeLanguage: "更改语言",
        back: "←",
        english: "英语",
        chinese: "简体中文"
      }
    };
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
      // Additional validation (redundant if middleware validates)
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
      throw error; // Let controller handle
    } finally {
      if (pool) await pool.close();
    }
  }

  /**
   * Gets translations for a specific language
   * @param {string} lang 
   * @returns {Object} Translation key-value pairs
   */
  getTranslations(lang = 'en') {
    return this.translations[lang] || this.translations.en;
  }
}

module.exports = TranslationModel;