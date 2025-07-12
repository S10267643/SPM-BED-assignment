const medicationModel = require("../models/medicationModel");

async function addMedicine(req, res) {
  try {
    const {
      user_id,
      medication_name,
      dosage,
      medication_time,
      day_of_week
    } = req.body;

    // Call the model function
    await medicationModel.addMedicine({
      user_id,
      medication_name,
      dosage,
      medication_time,
      day_of_week
    });

    res.status(201).json({ message: "Medication added successfully." });
  } catch (error) {
    console.error("Error in addMedicine:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { addMedicine };