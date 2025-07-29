const Joi = require("joi");

// Enhanced validation schemas with proper patterns and constraints
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
    .pattern(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(,(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Day of week must be valid day abbreviations separated by commas (e.g., "Mon,Tue,Wed")',
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
    .pattern(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(,(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/)
    .required()
    .messages({
      'string.pattern.base': 'Day of week must be valid day abbreviations separated by commas (e.g., "Mon,Tue,Wed")',
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

// Enhanced validation with custom business logic
const validateMedication = (req, res, next) => {
  const { error } = medicationValidationSchema.validate(req.body, { 
    abortEarly: false // Show all validation errors
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: "Validation error",
      details: errorMessages
    });
  }
  
  // Additional business logic validation
  const { refillThreshold, supplyQuantity } = req.body;
  if (refillThreshold >= supplyQuantity) {
    return res.status(400).json({
      error: "Validation error",
      details: ["Refill threshold must be less than supply quantity"]
    });
  }
  
  // Validate time format
  const { medication_time } = req.body;
  const times = medication_time.split(',');
  for (let time of times) {
    const timePattern = /^([0-1]?[0-9]):([0-5][0-9]) (AM|PM)$/;
    const match = time.trim().match(timePattern);
    if (!match) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid time format: ${time}. Use format like "09:30 AM"`]
      });
    }
    
    const hour = parseInt(match[1]);
    if (hour < 1 || hour > 12) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid hour: ${hour}. Hour must be between 1-12`]
      });
    }
  }
  
  // Validate days format
  const { day_of_week } = req.body;
  const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = day_of_week.split(',');
  for (let day of days) {
    if (!validDays.includes(day.trim())) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid day: ${day}. Valid days are: ${validDays.join(', ')}`]
      });
    }
  }
  
  next();
};

const validateUpdateMedication = (req, res, next) => {
  const { error } = updateMedicationValidationSchema.validate(req.body, { 
    abortEarly: false // Show all validation errors
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: "Validation error",
      details: errorMessages
    });
  }
  
  // Additional business logic validation
  const { refillThreshold, supplyQuantity } = req.body;
  if (refillThreshold >= supplyQuantity) {
    return res.status(400).json({
      error: "Validation error",
      details: ["Refill threshold must be less than supply quantity"]
    });
  }
  
  // Validate time format more strictly
  const { medication_time } = req.body;
  const times = medication_time.split(',');
  for (let time of times) {
    const timePattern = /^([0-1]?[0-9]):([0-5][0-9]) (AM|PM)$/;
    const match = time.trim().match(timePattern);
    if (!match) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid time format: ${time}. Use format like "09:30 AM"`]
      });
    }
    
    const hour = parseInt(match[1]);
    if (hour < 1 || hour > 12) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid hour: ${hour}. Hour must be between 1-12`]
      });
    }
  }
  
  // Validate days format
  const { day_of_week } = req.body;
  const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = day_of_week.split(',');
  for (let day of days) {
    if (!validDays.includes(day.trim())) {
      return res.status(400).json({
        error: "Validation error",
        details: [`Invalid day: ${day}. Valid days are: ${validDays.join(', ')}`]
      });
    }
  }
  
  next();
};

const validateMedicationId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      error: "Medication ID is required"
    });
  }
  
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
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