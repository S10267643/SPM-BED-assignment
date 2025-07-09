const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation"); // import User Validation Middleware

const notificationController = require("./controllers/NotificationController");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// User routes
app.get("/users", userController.getAllUsers);
app.get("/users/:id", validateUserId, userController.getUserById);
app.post("/users", validateUser, userController.createUser);
app.post("/users/login", userController.loginUser);


// Custom notifications routes 

app.post("/api/notifications", notificationController.createNotification);
app.put("/api/notifications/:userId", notificationController.editNotification);
app.delete("/api/notifications/:userId", notificationController.deleteNotification);
app.get("/api/notifications/:userId", notificationController.getNotification);




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
