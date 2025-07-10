const medicationModel = require("../models/medicationModel");

async function createMedicine(req, res) {
  try {
    const { medication_days, ...rest } = req.body;
    if (!medication_days) {
      return res.status(400).json({ error: "Medication days are required." });
    }

    // medication_days expected as comma-separated string like "1,3,5"
    const days = medication_days.split(",").map(d => parseInt(d.trim()));

    for (const day of days) {
      await medicationModel.addMedicine({ ...rest, medication_day: day });
    }

    res.status(201).json({ message: "Medication added for all selected days" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Unexpected error creating medicine" });
  }
}

module.exports = { createMedicine };
    
