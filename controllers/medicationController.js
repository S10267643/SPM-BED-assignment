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

async function getAllMedications(req, res) {
  try {
    const medications = await medicationModel.getAllMedications();
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error in getAllMedications:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllMedicationsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const medications = await medicationModel.getAllMedicationsByUserId(userId);
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error in getAllMedicationsByUserId:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getMedicationById(req, res) {
  try {
    const { id } = req.params;
    const medication = await medicationModel.getMedicationById(id);
    
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    res.status(200).json(medication);
  } catch (error) {
    console.error("Error in getMedicationById:", error);
    res.status(500).json({ error: error.message });
  }
}

async function updateMedicine(req, res) {
  try {
    const { id } = req.params;
    const {
      medication_name,
      dosage,
      medication_time,
      day_of_week
    } = req.body;

    // Call the model function
    await medicationModel.updateMedicine(id, {
      medication_name,
      dosage,
      medication_time,
      day_of_week
    });

    res.status(200).json({ message: "Medication updated successfully." });
  } catch (error) {
    console.error("Error in updateMedicine:", error);
    res.status(500).json({ error: error.message });
  }
}

async function deleteMedicine(req, res) {
  try {
    const { id } = req.params;
    
    await medicationModel.deleteMedicine(id);
    
    res.status(200).json({ message: "Medication deleted successfully." });
  } catch (error) {
    console.error("Error in deleteMedicine:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  addMedicine, 
  getAllMedications, 
  getAllMedicationsByUserId, 
  getMedicationById, 
  updateMedicine, 
  deleteMedicine 
};