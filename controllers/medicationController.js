const medicationModel = require("../models/medicationModel");

async function addMedicine(req, res) {
  try {
    const {
      user_id = 1,
      medication_name,
      medication_time,
      medication_prescription,
      medication_days
    } = req.body;



    for (const dayNum of medication_days) {
      await medicationModel.addMedicine({
        user_id : 1,
        medication_name,
        medication_time,
        medication_prescription,
        medication_day: dayNum
      });
    }

    res.status(201).json({ message: "Medication added successfully for all selected days." });
  } catch (error) {
    console.error("Error in addMedicine:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllMedications(req, res) {
  try {
    const meds = await medicationModel.getAllMedications();
    res.status(200).json(meds);
  } catch (error) {
    console.error("Error in getAllMedications:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { addMedicine, getAllMedications };
