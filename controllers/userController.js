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
    console.error("User creation error:", error.message);

    const statusCode = error.statusCode || 500;
    const message =
      error.message === "Email already exists"
        ? error.message
        : "Error creating user";

    res.status(statusCode).json({ error: message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
