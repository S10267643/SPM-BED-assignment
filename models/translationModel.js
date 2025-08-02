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
    pool = await sql.connect(dbConfig);

    // Begin transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // 1. Verify user exists
      const userCheck = await transaction.request()
        .input('userId', sql.Int, userId)
        .query('SELECT userId FROM users WHERE userId = @userId');
      
      if (userCheck.recordset.length === 0) {
        throw new Error('User not found');
      }

      // 2. Update language
      const updateResult = await transaction.request()
        .input('userId', sql.Int, userId)
        .input('language', sql.NVarChar(10), language === 'zh' ? 'Chinese' : 'English')
        .query(`UPDATE users SET preferredLanguage = @language 
                WHERE userId = @userId`);
      
      
      // Commit transaction
      await transaction.commit();
      
      return updateResult.rowsAffected[0] > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("DB Operation Failed:", {
      error: error.message,
      stack: error.stack
    });
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
      welcome_message: "Hello,",
      messages: "Messages",
      medication: "Medication",
      add_pills: "Add pills",
      emergency: "Emergency",

      // settings.html
      settings: "Settings",
      daily_summary: "Daily Summary",
      custom_notification: "Custom Notifications",
      medical_history: "Medical History",
      credits: "Credits",
      edit_profile: "Edit Profile",

      // addmedicine.html
      add_medication_title: "Add Medication",
      add_medication_header: "Add Medication",
      medication_name_label: "Name Of Medication",
      date_label: "Date",
      time_label: "Time",
      dosage_label: "Dosage",
      dosage_placeholder: "Enter dosage (e.g., 2 tablets)",
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
      notifications_header: "Custom Notifications",
      back_to_settings: "← Settings",
      title_label: "Title",
      enable_label: "Enable Push Notifications",
      imageLink_label: "Image Link",
      img_placeholder: "Enter image URL",
      ringtone_placeholder: "Enter text here",
      


      //startingPage.html
      caregiver_login: "Caregiver Login",

      // register.html
      register: "Register",
      name: "Name:",
      sign_up: "Sign Up",
      already_have_account: "Already have an account?",
      name_placeholder: "Enter your full name",
      email_placeholder: "Enter your email",
      password_placeholder: "Create a password",
      role_label: "Role:",
      role_caregiver: "Caregiver",
      role_elderly: "Elderly",

      // elderlyEditProfile.html
      phone_number: "Phone Number",
      phone_placeholder: "Enter your phone number",
      save_changes: "Save Changes",

      //caregiverChooseElderly.html
      choose_elderly: "Choose Elderly",
      manage_pills: "Manage Pills",
      recent_message: "Recent Messages",
      loading_messages: "Loading messages...",
      mark_as_read: "Mark as Read",
      view_medication: "View Medication",

      // caregiverAddmedicine.html
      elderly_name: "Elderly Name",
      choose_elderly: "Choose Elderly",
      medication_name: "Medication Name",
      choose_medication: "Choose Medication",
      dosage: "Dosage",
      dosage_placeholder: "e.g. 2 pills",
      supply_quantity: "Supply Quantity",
      refill_threshold: "Refill Threshold",
      select_all: "Select All",
      deselect_all: "Deselect All",
      medication_times: "Medication Time(s)",
      add_another_time: "Add Another Time",
      confirm: "Confirm",
      select_days: "Select Days",

      //elderlyMessages.html
      select_caregiver: "Select Caregiver",
      select_option: "Select a Caregiver",
      confirm_selection: "Confirm Selection",
      message_placeholder: "Type your message here...",
      send: "Send",
      no_messages: "No messages available",
      loading_messages: "Loading messages...",
      error_loading_messages: "Error loading messages",
      save: "Save",
      cancel: "Cancel",

      //emergencyContact.html
      emergency_contact: "Emergency Contacts",
      add_contact: "Add Contact",

      //editEmergencyContact.html
      edit_emergency_contacts: "Edit Emergency Contacts",
      name: "Name",
      phone_number: "Phone Number",
      cancel: "Cancel",
      edit_contact: "Edit Contact",
      son: "Son",
      daughter: "Daughter",
      spouse: "Spouse",
      friend: "Friend",
      relative: "Relative",
      other: "Other",
      parent: "Parent",
      sibling: "Sibling",
      doctor: "Doctor",
      caregiver: "Caregiver",
      neighbor: "Neighbor",
      relationship: "Relationship",
      select_relationship: "Select Relationship",

      //addEmergencyContact.html
      add_emergency_contact: "Add Emergency Contact",

       // caregiverDeletemedicine.html
      edit_medication: "Edit Medication",
      pick_medicine: "Pick Medicine",
      delete: "Delete",
      edit: "Edit",

      //medical-historyCaregiver.html
      back_to_settings: "← Settings",
      medication_history_title: "Medication History for Selected Elderly",
      refresh_list: "Refresh List",
      add_new_record: "Add New Record",
      medication: "Medication",
      dosage: "Dosage",
      actions: "Actions",
      medication_id: "Medication ID",
      dosage_label: "Dosage:",
      pills_left_label: "Pills Left:",
      notes: "Notes:",







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