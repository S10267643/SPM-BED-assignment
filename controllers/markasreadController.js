const MarkAsReadModel = require("../models/markasreadModel");

async function createMedicationLog(req, res) {
  const { userId, medId } = req.body;
  
  if (!userId || !medId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await MarkAsReadModel.createMedicationLog(userId, medId);
    res.status(201).json({ message: "Medication taken logged successfully" });
  } catch (err) {
    console.error("Create Medication Log Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteMedicationLog(req, res) {
  const { userId, medId } = req.query; // Changed from params to query
  
  if (!userId || !medId) {
    return res.status(400).json({ error: "Missing user ID or medication ID" });
  }

  try {
    await MarkAsReadModel.deleteMedicationLog(userId, medId);
    res.json({ message: "Medication log removed successfully" });
  } catch (err) {
    console.error("Delete Medication Log Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createMedicationLog,
  deleteMedicationLog
};