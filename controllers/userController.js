const userModel = require("../models/userModel");

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
}

// Get user by ID
async function getUserById(req, res) {
  const id = parseInt(req.params.id);
  try {
    const user = await userModel.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user" });
  }
}

// Register new user
async function createUser(req, res) {
  try {
    const newUser = await userModel.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    // Handle known (custom) errors from model
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    // Fallback to generic error
    console.error("Controller error:", error);
    res.status(500).json({ error: "Unexpected error creating user" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  loginUser
};
