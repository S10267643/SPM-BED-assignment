const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();
const verifyJWT = require("./middlewares/verifyJWT");






const app = express();
const port = process.env.PORT || 3000;



//user Controllers
const userController = require("./controllers/userController");
const userValidation = require("./middlewares/userValidation");

// notification controller
const notificationController = require("./controllers/NotificationController");

//translation controllers
const translationController = require("./controllers/translationController");

//medicationHistory controller
const medicationHistoryController = require("./controllers/medicationHistoryController")
//medicationSchedule controllers
const medicationValidation = require("./middlewares/medicationValidation");
const medicationController = require("./controllers/medicationController");



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// User routes
app.get("/users/:id", userValidation.validateUserId, userController.getUserById); //for future use when view/edit profile
app.post("/users", userValidation.validateUser, userController.createUser);
app.post("/users/login", userController.loginUser);

// Forget password routes
app.post("/users/send-otp", userValidation.validateSendOtp, userController.sendOTP);
app.post("/users/verify-otp", userValidation.validateVerifyOtp, userController.verifyOTP);
app.post("/users/reset-password", userValidation.validateResetPassword, userController.resetPassword);

// Custom notifications routes 
app.post("/api/notifications", notificationController.createNotification);
app.put("/api/notifications/:userId", notificationController.editNotification);
app.delete("/api/notifications/:userId", notificationController.deleteNotification);
app.get("/api/notifications/:userId", notificationController.getNotification);

app.post("/api/subscribe", notificationController.updateNotificationTokenByUserid);
app.get("/api/sendNotifications", notificationController.sendNotifications);

//medicationSchedule routes
app.post('/api/medications', verifyJWT, medicationValidation.validateMedication, medicationController.addMedicine);
app.get('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.getMedicationById);
app.get('/api/medications/user/:userId',medicationController.getAllMedicationsByUserId);
app.put('/api/medications/:id', medicationValidation.validateMedicationId, medicationValidation.validateUpdateMedication, medicationController.updateMedicine);
app.delete('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.deleteMedicine);

//Medication History routes
app.get('/api/medicationHistory/:id', medicationHistoryController.getMedicalHistoryById); // More specific route first
app.get('/api/medicationHistory/user/:userId', medicationHistoryController.getMedicalHistoryByUserId); // Changed path to avoid conflict

// Translation routes
app.get("/api/translations", translationController.getTranslations);
app.post("/api/update-language", translationController.updateLanguagePreference);









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
