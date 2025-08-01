const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
    const { name, email, phone, password, preferredLanguage, role, captcha } = req.body;

    // Step 1: Check captcha token
    if (!captcha) {
      return res.status(400).json({ error: "Captcha is required" });
    }

    // Step 2: Verify captcha with Google
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    params.append("response", captcha);

    const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // Step 3: Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingName = await userModel.getUserByUsername(name);
    if (existingName) {
      return res.status(400).json({ error: "This name is already taken. Please choose another." });
    }

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "This email is already registered. Try logging in." });
    }

    // Step 4: Hash password and create user
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
  const { email, password, captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ error: "Captcha is required" });
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
    params.append('response', captcha);

    const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Print token in terminal for Swagger testing
    console.log("Generated JWT Token:", token);

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.userId,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Configure your email transporter for sending OTPs
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Get user by role
async function getUsersByRole(req, res) {
  const role = req.query.role;

  if (!role) {
    return res.status(400).json({ error: "Missing role query parameter" });
  }

  try {
    const users = await userModel.getUserByRole(role);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Send OTP to user's email
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


async function updateUser(req, res) {
  const userId = parseInt(req.params.id);
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  try {
    const result = await userModel.updateUserById(userId, { name, email, phone, password });
    res.json(result);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
}


module.exports = {
  getUserById,
  createUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getUsersByRole,
  resetPassword,
  updateUser
};
