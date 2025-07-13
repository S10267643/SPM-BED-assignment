const Joi = require("joi");

const medicationValidationSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  medication_name: Joi.string().max(50).required(),
  dosage: Joi.string().max(50).required(),
  medication_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // expects HH:mm:ss 24-hour format
    .required(),
  day_of_week: Joi.number().integer().min(1).max(7).required()
});

const updateMedicationValidationSchema = Joi.object({
  medication_name: Joi.string().max(50).required(),
  dosage: Joi.string().max(50).required(),
  medication_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // expects HH:mm:ss 24-hour format
    .required(),
  day_of_week: Joi.number().integer().min(1).max(7).required()
});

const validateMedication = (req, res, next) => {
  const { error } = medicationValidationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details[0].message
    });
  }
  
  next();
};

const validateUpdateMedication = (req, res, next) => {
  const { error } = updateMedicationValidationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details[0].message
    });
  }
  
  next();
};

const validateMedicationId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      error: "Invalid medication ID"
    });
  }
  
  next();
};

module.exports = {
  validateMedication,
  validateUpdateMedication,
  validateMedicationId
};