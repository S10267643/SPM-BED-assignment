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

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---
app.use(express.static(path.join(__dirname, "public")));

// Routes for users
app.get("/users", userController.getAllUsers);
app.get("/users/:id", validateUserId, userController.getUserById); // Use validateUserId middleware
app.post("/users", validateUser, userController.createUser); // Use validateUser middleware
app.post("/users/login", userController.loginUser);


// Add routes for PUT/DELETE with validation middleware


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
