const Joi = require("joi");

// Schema for user registration
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(""),
  password: Joi.string().min(6).required(),
  preferred_language: Joi.string().optional()
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

module.exports = {
  validateUser,
  validateUserId,
};
