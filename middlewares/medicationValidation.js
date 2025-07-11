const Joi = require("joi");

const medicationSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  medication_name: Joi.string().max(50).required(),
  medication_time: Joi.string().required(),
  medication_prescription: Joi.string().allow("").max(200),
    medication_days: Joi.array().items(Joi.number().integer().min(1).max(7)).min(1).required()

});

function validateMedication(req, res, next) {
  const { error } = medicationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = validateMedication;