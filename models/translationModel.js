const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class TranslationModel {
  constructor() {
    if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Missing required Google Cloud configuration. Please set GOOGLE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS');
    }

    this.translationClient = new TranslationServiceClient({
      projectId: process.env.GOOGLE_PROJECT_ID, // No fallback!
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    this.location = 'global';
    this.translationCache = new Map();
    this.projectId = process.env.GOOGLE_PROJECT_ID; // No fallback!
  }

  async updateLanguagePreference(userId, language) {
    let pool;
    try {
      if (!['English', 'Chinese'].includes(language)) {
        throw new Error('Invalid language code');
      }

      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('language', sql.NVarChar(10), language)
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

  async getTranslations(targetLang = 'English') {
    const cacheKey = `translations_${targetLang}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    // Define source strings in English
    const sourceStrings = {
      // change-language.html
      changeLanguage: "Change Language",
      english: "English",
      chinese: "Chinese",
      title: "DailyDose",

      // index.html
      welcome_message: "Hello, User!",
      messages: "Messages",
      medication: "Medication",
      add_pills: "Add pills",
      emergency: "Emergency",

      // settings.html
      settings: "Settings",
      daily_summary: "Daily Summary",
      custom_notification: "Custom Notifications",
      medical_history: "Medical History",

      // addmedicine.html
      add_medication_title: "Add Medication",
      add_medication_header: "Add Medication",
      medication_name_label: "Name Of Medication",
      date_label: "Date",
      time_label: "Time",
      dosage_label: "Dosage",
      cancel_button: "Cancel",
      confirm_button: "Confirm",

      // caregiverLogin.html
      login_header: "Login",
      email_label: "Email Address:",
      password_label: "Password:",
      forgot_password: "Forgot Password?",
      sign_in_button: "Sign In",

      //login.html
      create_account_prompt: "Don't have an account yet? ",
      create_account: "Create Account",

      //custom-notifications.html
      notifications_title: "Custom Notifications",
      notifications_header: "Custom Notifications",
      back_to_settings: "← Settings",
      ringtone_label: "Ringtone:",
      vibration_label: "Vibration:",
      vibration_on: "On",
      vibration_off: "Off",
      repeat_label: "Repeat Count:",
      youtube_label: "YouTube Link (optional):",

      //startingPage.html
      caregiver_login: "Caregiver Login",

      // register.html
      register: "Register",
      name: "Name:",
      sign_up: "Sign Up",
      already_have_account: "Already have an account?",



    };

    // Return source strings directly for English
    if (targetLang === 'English') {
      this.translationCache.set(cacheKey, sourceStrings);
      return sourceStrings;
    }

    try {
      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: Object.values(sourceStrings),
        mimeType: 'text/plain',
        sourceLanguageCode: 'en',
        targetLanguageCode: 'zh', 
      };

      const [response] = await this.translationClient.translateText(request);

      const translations = {};
      let i = 0;
      for (const key in sourceStrings) {
        translations[key] = response.translations[i].translatedText;
        i++;
      }

      this.translationCache.set(cacheKey, translations);
      return translations;
    } catch (error) {
      console.error('Translation API error:', error);
      if (error.message.includes('Could not load the default credentials')) {
        throw new Error('Google Cloud credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
      }
      throw error;
    }
  }
}

module.exports = TranslationModel;