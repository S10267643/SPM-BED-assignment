const userModel = require("../models/medicationModel");

//Add Medication

async function createMedicine(req, res) {
    try {
        const newMedicine = await medicationModel.addMedicine(req.body);
        res.status(201).json(newMedicine);
    } catch (error) {
    // Handle known (custom) errors from model
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    // Fallback to generic error
    console.error("Controller error:", error);
    res.status(500).json({ error: "Unexpected error creating medicine" });
  }
}
    
