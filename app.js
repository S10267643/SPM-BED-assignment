const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec


dotenv.config(); // Load environment variables
require("./utils/dailySummaryScheduler");
const verifyJWT = require("./middlewares/verifyJWT");

const app = express();
const port = process.env.PORT || 3000;

const userController = require("./controllers/userController");
const userValidation = require("./middlewares/userValidation");

const emergencyController = require("./controllers/emergencyController");
const { validateContact } = require("./middlewares/emergencyValidation");

// notification controller
const notificationController = require("./controllers/notificationController");


const refillNotificationController = require("./controllers/refillNotificationController");

//translation controllers
const translationController = require("./controllers/translationController");

//medicationHistory controller
const medicationHistoryController = require("./controllers/medicationHistoryController");

//medicationSchedule controllers
const medicationValidation = require("./middlewares/medicationValidation");
const medicationController = require("./controllers/medicationController");

// messages controller
const messageController = require("./controllers/messagesController");
//dailysummary thing
const dailySummaryController = require("./controllers/dailySummaryController");


// MarkasDone controller
const markasdoneController = require("./controllers/markasdoneController");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// User routes
app.get("/users/:id", userValidation.validateUserId, userController.getUserById); //for future use when view/edit profile
app.post("/users", userValidation.validateUser, userController.createUser);
app.post("/users/login", userController.loginUser);
app.get("/users", userController.getUsersByRole); // Get users by role
app.put("/users/:id", userController.updateUser);

// Forget password routes
app.post("/users/send-otp", userValidation.validateSendOtp, userController.sendOTP);
app.post("/users/verify-otp", userValidation.validateVerifyOtp, userController.verifyOTP);
app.post("/users/reset-password", userValidation.validateResetPassword, userController.resetPassword);

// Emergency Contact routes
app.get('/api/emergency-contacts', verifyJWT, emergencyController.getAllEmergencyContactsByUser);
app.post('/api/emergency-contacts', verifyJWT, emergencyController.createEmergencyContact);
app.get('/api/emergency-contacts/:id', verifyJWT, emergencyController.getEmergencyContactById);
app.put('/api/emergency-contacts/:id', verifyJWT, emergencyController.updateEmergencyContact);
app.delete('/api/emergency-contacts/:id', verifyJWT, emergencyController.deleteEmergencyContact);

// Custom notifications routes 
app.post("/api/notifications", notificationController.createNotification);
app.put("/api/notifications/:userId", notificationController.editNotification);
app.delete("/api/notifications/:userId", notificationController.deleteNotification);
app.get("/api/notifications/:userId", notificationController.getNotification);

app.post("/api/subscribe", notificationController.updateNotificationTokenByUserid);
app.get("/api/sendNotifications", notificationController.sendNotifications);

//medicationSchedule routes
app.post('/api/medications', verifyJWT, medicationValidation.validateMedication, medicationController.addMedicine);

// ✅ New route to return all medications for dropdown
app.get('/api/medications/all', medicationController.getAllMedicationNames);

app.get('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.getMedicationById);
app.get('/api/medications/user/:userId', medicationController.getAllMedicationsByUserId);
app.put('/api/medications/:id', medicationValidation.validateMedicationId, medicationValidation.validateUpdateMedication, medicationController.updateMedicine);
app.delete('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.deleteMedicine);

//Medication History routes
app.get('/api/medication-history', verifyJWT, medicationHistoryController.fetchMedicalHistoryByUserId);
app.get('/api/medication-history/:id', verifyJWT, medicationHistoryController.fetchMedicalHistoryById);
app.post('/api/medication-history', verifyJWT, medicationHistoryController.createMedicalHistory);
app.put('/api/medication-history/:id', verifyJWT, medicationHistoryController.modifyMedicalHistory);
app.delete('/api/medication-history/:id', verifyJWT, medicationHistoryController.removeMedicalHistory);


// Daily Summary Routes (Elderly and Caregiver)
app.get("/api/daily-summaries", verifyJWT, dailySummaryController.getDailySummary); // today's summary
app.get("/api/daily-summaries/by-date", verifyJWT, dailySummaryController.getUserSummaryByDate); // for elderly
app.get("/api/daily-summaries/user/:userId/by-date", verifyJWT, dailySummaryController.getElderlySummaryByDate); // caregiver views summary of elderly


//Refill Reminder Notifcation Route
app.get('/api/refill-check/:userId', verifyJWT, refillNotificationController.checkRefillThreshold);


// Translation routes
app.get("/api/translations", translationController.getTranslations);
app.post("/api/update-language", translationController.updateLanguagePreference);


// Message routes
app.get("/api/messages/user/:userId", messageController.getMessages);
app.get("/api/messages/conversation/:elderlyId/:caregiverId", messageController.getConversation);
app.post("/api/messages", messageController.sendMessage);
app.put("/api/messages/:messageId", messageController.editMessage); 
app.delete("/api/messages/:messageId", messageController.deleteMessage);
app.get("/api/messages/caregiver", messageController.getMessagesForCaregiver);

// Mark as Read routes
app.post("/api/medication-logs", markasdoneController.createMedicationLog);
app.delete("/api/medication-logs", markasdoneController.deleteMedicationLog);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
