const Joi = require("joi");

// Joi schema for adding medication
const medicationValidationSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required'
  }),
  medId: Joi.number().integer().positive().required().messages({
    'number.base': 'Medication ID must be a number',
    'number.positive': 'Medication ID must be positive',
    'any.required': 'Medication ID is required'
  }),
  dosage: Joi.string().max(50).trim().required().messages({
    'string.base': 'Dosage must be a string',
    'string.max': 'Dosage cannot exceed 50 characters',
    'any.required': 'Dosage is required'
  }),
  medication_time: Joi.string()
    .pattern(/^([0-1]?[0-9]:[0-5][0-9] (AM|PM))(,([0-1]?[0-9]:[0-5][0-9] (AM|PM)))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Medication time must be in format "HH:MM AM/PM" separated by commas (e.g., "09:30 AM,06:00 PM")',
      'any.required': 'Medication time is required'
    }),
  day_of_week: Joi.string()
    .pattern(/^(0|1|2|3|4|5|6)(,(0|1|2|3|4|5|6))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Day of week must be integers 0 (Sun) through 6 (Sat) separated by commas (e.g., "0,1,2")',
      'any.required': 'Day of week is required'
    }),
  refillThreshold: Joi.number().integer().min(1).required().messages({
    'number.base': 'Refill threshold must be a number',
    'number.min': 'Refill threshold must be at least 1',
    'any.required': 'Refill threshold is required'
  }),
  supplyQuantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Supply quantity must be a number',
    'number.min': 'Supply quantity must be at least 1',
    'any.required': 'Supply quantity is required'
  })
});

// Joi schema for updating medication
const updateMedicationValidationSchema = Joi.object({
  medId: Joi.number().integer().positive().required().messages({
    'number.base': 'Medication ID must be a number',
    'number.positive': 'Medication ID must be positive',
    'any.required': 'Medication ID is required'
  }),
  dosage: Joi.string().max(50).trim().required().messages({
    'string.base': 'Dosage must be a string',
    'string.max': 'Dosage cannot exceed 50 characters',
    'any.required': 'Dosage is required'
  }),
  medication_time: Joi.string()
    .pattern(/^([0-1]?[0-9]:[0-5][0-9] (AM|PM))(,([0-1]?[0-9]:[0-5][0-9] (AM|PM)))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Medication time must be in format "HH:MM AM/PM" separated by commas (e.g., "09:30 AM,06:00 PM")',
      'any.required': 'Medication time is required'
    }),
  day_of_week: Joi.string()
    .pattern(/^(0|1|2|3|4|5|6)(,(0|1|2|3|4|5|6))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Day of week must be integers 0 (Sun) through 6 (Sat) separated by commas (e.g., "0,1,2")',
      'any.required': 'Day of week is required'
    }),
  refillThreshold: Joi.number().integer().min(1).required().messages({
    'number.base': 'Refill threshold must be a number',
    'number.min': 'Refill threshold must be at least 1',
    'any.required': 'Refill threshold is required'
  }),
  supplyQuantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Supply quantity must be a number',
    'number.min': 'Supply quantity must be at least 1',
    'any.required': 'Supply quantity is required'
  })
});

// Common reusable day validator
const isValidDays = (dayList) => {
  const valid = ['0','1','2','3','4','5','6'];
  return dayList.every(day => valid.includes(day.trim()));
};

const isValidTime = (time) => {
  const timePattern = /^([0-1]?[0-9]):([0-5][0-9]) (AM|PM)$/;
  const match = time.trim().match(timePattern);
  if (!match) return false;
  const hour = parseInt(match[1]);
  return hour >= 1 && hour <= 12;
};

// Middleware for adding medication
const validateMedication = (req, res, next) => {
  const { error } = medicationValidationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map(d => d.message)
    });
  }

  const { refillThreshold, supplyQuantity, medication_time, day_of_week } = req.body;

  if (refillThreshold >= supplyQuantity) {
    return res.status(400).json({
      error: "Validation error",
      details: ["Refill threshold must be less than supply quantity"]
    });
  }

  // Validate all times
  const times = medication_time.split(",");
  for (let time of times) {
    if (!isValidTime(time)) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid time format: ${time}. Use HH:MM AM/PM`]
      });
    }
  }

  // Validate all days
  const days = day_of_week.split(",");
  if (!isValidDays(days)) {
    return res.status(400).json({
      error: "Validation error",
      details: [`Invalid day(s): ${day_of_week}. Valid days are 0 (Sun) to 6 (Sat)`]
    });
  }

  next();
};

// Middleware for updating medication
const validateUpdateMedication = (req, res, next) => {
  const { error } = updateMedicationValidationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map(d => d.message)
    });
  }

  const { refillThreshold, supplyQuantity, medication_time, day_of_week } = req.body;

  if (refillThreshold >= supplyQuantity) {
    return res.status(400).json({
      error: "Validation error",
      details: ["Refill threshold must be less than supply quantity"]
    });
  }

  const times = medication_time.split(",");
  for (let time of times) {
    if (!isValidTime(time)) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid time format: ${time}. Use HH:MM AM/PM`]
      });
    }
  }

  const days = day_of_week.split(",");
  if (!isValidDays(days)) {
    return res.status(400).json({
      error: "Validation error",
      details: [`Invalid day(s): ${day_of_week}. Valid days are 0 (Sun) to 6 (Sat)`]
    });
  }

  next();
};

// Middleware to validate medication ID from route
const validateMedicationId = (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (!id || isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Invalid medication ID - must be a positive integer"
    });
  }

  next();
};

module.exports = {
  validateMedication,
  validateUpdateMedication,
  validateMedicationId
};
