const medicationModel = require("../models/medicationModel");

async function addMedicine(req, res) {
  try {
    const {
      user_id,
      medId,
      dosage,
      medication_time,
      day_of_week,
      refillThreshold,
      supplyQuantity
    } = req.body;

    // validation
    if (refillThreshold >= supplyQuantity) {
      return res.status(400).json({ 
        error: "Refill threshold must be less than supply quantity" 
      });
    }

    const result = await medicationModel.addMedicine({
      userId: user_id,
      medId,
      dosage,
      medication_time,  
      day_of_week,      
      refillThreshold,
      supplyQuantity
    });

    // Check database response
    if (result.success && result.rowsAffected > 0) {
      res.status(201).json({ 
        message: "Medication added successfully.",
        data: { rowsAffected: result.rowsAffected } 
      });
    } else {
      res.status(500).json({ error: "Failed to add medication" });
    }
    
  } catch (error) {
    console.error("Error in addMedicine:", error);
    
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("already assigned")) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function getAllMedications(req, res) {
  try {
    const medications = await medicationModel.getAllMedications();
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error in getAllMedications:", error);
    res.status(500).json({ error: "Failed to retrieve medications" });
  }
}

async function getAllMedicationsByUserId(req, res) {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const medications = await medicationModel.getAllMedicationsByUserId(userId);
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error in getAllMedicationsByUserId:", error);
    res.status(500).json({ error: "Failed to retrieve user medications" });
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
    res.status(500).json({ error: "Failed to retrieve medication" });
  }
}

async function updateMedicine(req, res) {
  try {
    const { id } = req.params;
    const {
      medId,
      dosage,
      medication_time,
      day_of_week,
      refillThreshold,
      supplyQuantity
    } = req.body;

    // validation
    if (refillThreshold >= supplyQuantity) {
      return res.status(400).json({ 
        error: "Refill threshold must be less than supply quantity" 
      });
    }

    const result = await medicationModel.updateMedicine(id, {
      medId,
      dosage,
      medication_time,  
      day_of_week,      
      refillThreshold,
      supplyQuantity
    });

    if (result.success) {
      res.status(200).json({ 
        message: "Medication updated successfully.",
        data: { rowsAffected: result.rowsAffected }
      });
    } else {
      res.status(500).json({ error: "Failed to update medication" });
    }
    
  } catch (error) {
    console.error("Error in updateMedicine:", error);
    
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function deleteMedicine(req, res) {
  try {
    const { id } = req.params;
    
    const result = await medicationModel.deleteMedicine(id);
    
    if (result.success) {
      res.status(200).json({ 
        message: "Medication deleted successfully.",
        data: { rowsAffected: result.rowsAffected }
      });
    } else {
      res.status(500).json({ error: "Failed to delete medication" });
    }
    
  } catch (error) {
    console.error("Error in deleteMedicine:", error);
    
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function getAllMedicationNames(req, res) {
  try {
    const meds = await medicationModel.getAllMedicationNames();
    console.log("Returning medications:", meds);
    res.status(200).json(meds);
  } catch (error) {
    console.error("Error in getAllMedicationNames:", error);
    res.status(500).json({ error: "Failed to retrieve medication names" });
  }
}

module.exports = {
  addMedicine,
  getAllMedications,
  getAllMedicationsByUserId,
  getMedicationById,
  updateMedicine,
  deleteMedicine,
  getAllMedicationNames
};