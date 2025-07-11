/*const Joi = require("joi");

const medicationValidation = Joi.object({
  user_id: Joi.number().integer().required(),
  medication_name: Joi.string().max(50).required(),
  medication_prescription: Joi.string().max(50).required(),
  medication_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // expects HH:mm:ss 24-hour format
    .required(),
  day: Joi.number().integer().min(1).max(7).required()
});

module.exports = { medicationValidation };
*/