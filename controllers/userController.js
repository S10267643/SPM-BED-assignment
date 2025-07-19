const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
    const { name, email, phone, password, preferredLanguage, role } = req.body;

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
      preferredLanguage,
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
      { userId: user.userId, role: user.role }, // role can be "elderly" or "caregiver"
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return BOTH token AND user ID
    res.status(200).json({ 
    message: "Login successful", 
    token,
    userId: user.userId,
    role: user.role 
});


  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Configure your email transporter for sending OTPs (use your SMTP or Gmail credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Check if user exists
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Email not registered" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry: 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP in DB
    await userModel.storeOTP(email, otp, expiresAt);

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your DailyDose Password Reset OTP",
      text: `Your OTP code is ${otp}. It will expire in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

async function verifyOTP(req, res) {
  const { email, otp: submittedOtp } = req.body;

  try {
    const otpData = await userModel.getOTPRecord(email);

    if (!otpData) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    const { storedOtp, otpExpirationTime } = otpData;

    if (submittedOtp !== storedOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > otpExpirationTime) {
      return res.status(400).json({ error: "Expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Server error while verifying OTP" });
  }
}

async function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    await userModel.resetPassword(email, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

module.exports = {
  getUserById,
  createUser,
  loginUser,
  sendOTP,
  verifyOTP,
  resetPassword,
};
