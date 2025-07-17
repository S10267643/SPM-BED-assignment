const Joi = require("joi");

// Schema for user registration
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("Elderly", "Caregiver").required().messages({
    "string.base": "Role must be a string",
    "any.only": "Role must be either 'Elderly' or 'Caregiver'",
    "any.required": "Role is required"
  }),
});


// Validate request body for user creation
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: messages });
  }
  next();
}

// Validate user ID from route
function validateUserId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  next();
}

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

// Language validation schema
const languageSchema = Joi.object({
  language: Joi.string().valid('en', 'zh').required().messages({
    "string.base": "Language must be a string",
    "any.only": "Language must be either 'en' or 'zh'",
    "any.required": "Language is required"
  })
});

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
  }
  next();
}

function validateLanguage  (req, res, next) {
    const { error } = languageSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return res.status(400).json({ error: messages });
    }
    next();
  }

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(8).required(),
});

function validateSendOtp(req, res, next) {
  const { error } = sendOtpSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
  next();
}

function validateVerifyOtp(req, res, next) {
  const { error } = verifyOtpSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
  next();
}

function validateResetPassword(req, res, next) {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
  next();
}


module.exports = {
  validateUser,
  validateUserId,
  validateLogin,
  validateLanguage,
  validateSendOtp,
  validateVerifyOtp,
  validateResetPassword,
};