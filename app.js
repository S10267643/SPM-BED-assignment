const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

const verifyJWT = require("./middlewares/verifyJWT");

// Load environment variables



dotenv.config();




//user Controllers
const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation"); // import User Validation Middleware


const notificationController = require("./controllers/NotificationController");

//medication controllers
const medicationController = require("./controllers/medicationController");
const medicationValidation = require("./middlewares/medicationValidation");





const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// User routes
app.get("/users/:id", validateUserId, userController.getUserById); //for future use when view/edit profile
app.post("/users", validateUser, userController.createUser);
app.post("/users/login", userController.loginUser);



// Custom notifications routes 

app.post("/api/notifications", notificationController.createNotification);
app.put("/api/notifications/:userId", notificationController.editNotification);
app.delete("/api/notifications/:userId", notificationController.deleteNotification);
app.get("/api/notifications/:userId", notificationController.getNotification);

//Medication routes
app.post('/api/medications', verifyJWT, medicationValidation, medicationController.addMedicine);
app.get("/api/medications", medicationController.getAllMedications);







// Translation routes
// app.post("/api/update-language", translationController.updateLanguagePreference);


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
