const medicationModel = require("../models/medicationModel");

const dayMap = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7
};

async function createMedicine(req, res) {
  try {
    const {
      user_id,
      medication_name,
      medication_time,
      medication_prescription,
      medication_days // e.g. "Mon,Wed,Fri"
    } = req.body;

    if (!medication_days || !medication_name || !medication_time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const daysArray = medication_days
      .split(",")
      .map(day => dayMap[day.trim()])
      .filter(Boolean); // remove any invalid days

    for (const dayNum of daysArray) {
      await medicationModel.addMedicine({
        user_id,
        medication_name,
        medication_time,
        medication_prescription,
        medication_day: dayNum
      });
    }

    res.status(201).json({ message: "Medication added for selected days." });
  } catch (error) {
    console.error("Create medicine error:", error);
    res.status(500).json({ error: "Failed to add medication." });
  }
}

module.exports = { createMedicine };
