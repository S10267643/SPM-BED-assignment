const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
    const { name, email, phone, password, preferred_language, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if name or email already exists
    const existingName = await userModel.getUserByUsername(name);
    if (existingName) {
      return res.status(400).json({ error: "This name is already taken. Please choose another." });
    }

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "This email is already registered. Try logging in." });
    }

    // Hash password before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      preferred_language,
      role
    });

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
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    
    const token = jwt.sign(
      { userId: user.user_id, role: user.role }, // role can be "elderly" or "caregiver"
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return BOTH token AND user ID
    res.status(200).json({ 
    message: "Login successful", 
    token,
    userId: user.user_id,
    role: user.role 
});


  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
  getUserById,
  createUser,
  loginUser
};
