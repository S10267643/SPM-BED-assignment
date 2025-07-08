const userModel = require("../models/medicationModel");

//Add Medication

async function addMedicine(req, res) {
    try {
        const newMedicine = await medicationModel.addMedicine(req.body);
        res.status(201).json(newMedicine);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Unexpected error creating user" });
    }
    
}