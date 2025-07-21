const Joi = require("joi");

// Validation schema for emergency contacts
const emergencyContactSchema = Joi.object({
  contactName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Contact name must be a string",
    "string.empty": "Contact name cannot be empty",
    "string.min": "Contact name must be at least 2 characters long",
    "string.max": "Contact name cannot exceed 100 characters",
    "any.required": "Contact name is required"
  }),
  phoneNumber: Joi.string()
      .pattern(/^[89]\d{7}$/)
      .required()
      .messages({
          "string.base": "Phone number must be a string",
          "string.empty": "Phone number cannot be empty",
          "string.pattern.base": "Phone number must be a valid Singapore number (start with 8 or 9, 8 digits total)",
          "any.required": "Phone number is required"
      }),
  relationship: Joi.string()
    .valid(
      'son',
      'daughter',
      'spouse',
      'parent',
      'sibling',
      'doctor',
      'caregiver',
      'friend',
      'neighbor',
      'other'
    )
    .required()
    .messages({
      "string.base": "Relationship must be a string",
      "string.empty": "Relationship cannot be empty",
      "any.only": "Relationship must be one of: son, daughter, spouse, parent, sibling, doctor, caregiver, friend, neighbor, other",
      "any.required": "Relationship is required"
    })
});

// Middleware to validate contact data (for POST/PUT)
function validateEmergencyContact(req, res, next) {
  const { error } = emergencyContactSchema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

module.exports = {
  validateEmergencyContact,
};