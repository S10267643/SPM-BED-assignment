const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

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
    const { name, email, phone, password, preferred_language } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if name or email already exists
    const existingName = await userModel.getUserByUsername(name);
    if (existingName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password before creating user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      preferred_language,
    });

    // Remove password before returning user object
    delete newUser.password;

    res.status(201).json(newUser);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Controller error:", error);
    res.status(500).json({ error: "Unexpected error creating user" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = {
  getUserById,
  createUser,
  loginUser
};
