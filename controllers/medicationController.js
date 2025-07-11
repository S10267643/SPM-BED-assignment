const bcrypt = require("bcryptjs");
const medicationModel = require("../models/medicationModel");

async function addMedication(req, res) {
 // const { error, value } = medicationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    await createMedication(value);
    return res.status(201).json({ message: "Medication added successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

module.exports = { addMedication };
