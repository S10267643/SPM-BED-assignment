const medicationHistoryModel = require("../models/medicationHistoryModel");

// GET all medication history for a specific user (summary view)
async function getMedicalHistoryByUserId(req, res) {
    const { userId } = req.params;

    try {
        const history = await medicationHistoryModel.getMedicationHistoryByUserId(userId);
        res.status(200).json(history);
    } catch (error) {
        console.error("Failed to fetch medication history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// GET detailed medication history record by ID
async function getMedicalHistoryById(req, res) {
    const { id } = req.params;

    try {
        const record = await medicationHistoryModel.getMedicationHistoryById(id);
        if (!record) {
            return res.status(404).json({ error: "Record not found" });
        }
        res.status(200).json(record);
    } catch (error) {
        console.error("Failed to fetch medication record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}





module.exports = {
    getMedicalHistoryByUserId,
    getMedicalHistoryById
};

