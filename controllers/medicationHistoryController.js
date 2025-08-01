const {
    getMedicationHistoryByUserId,
    getMedicationHistoryById,
    addMedicationHistory,
    updateMedicationHistory,
    deleteMedicationHistory
} = require("../models/medicationHistoryModel");

// Caregiver & Senior: View summary
async function fetchMedicalHistoryByUserId(req, res) {
    try {
        const userId = req.user.role === "Caregiver"
            ? req.query.userId
            : req.user.userId;

        if (!userId) {
            return res.status(400).json({ error: "Missing target user ID" });
        }

        const result = await getMedicationHistoryByUserId(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching medical history summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}


// Caregiver & Senior: View individual record (full detail)
async function fetchMedicalHistoryById(req, res) {
    try {
        const { id } = req.params;
        const result = await getMedicationHistoryById(id);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching medication detail:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Caregiver: Add new history record
async function createMedicalHistory(req, res) {
    if (req.user.role !== "Caregiver") {
        return res.status(403).json({ error: "Forbidden: Only caregivers can add records." });
    }

    try {
        const success = await addMedicationHistory(req.body);
        if (success) res.status(201).json({ message: "Record added successfully" });
        else res.status(400).json({ error: "Failed to add record" });
    } catch (err) {
        console.error("Error adding medication record:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Caregiver: Edit existing history record
async function modifyMedicalHistory(req, res) {
    if (req.user.role !== "Caregiver") {
        return res.status(403).json({ error: "Forbidden: Only caregivers can modify records." });
    }

    try {
        const { id } = req.params;
        const success = await updateMedicationHistory(id, req.body);
        if (success) res.status(200).json({ message: "Record updated" });
        else res.status(400).json({ error: "Failed to update record" });
    } catch (err) {
        console.error("Error updating medication record:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Caregiver: Delete record
async function removeMedicalHistory(req, res) {
    if (req.user.role !== "Caregiver") {
        return res.status(403).json({ error: "Forbidden: Only caregivers can delete records." });
    }

    try {
        const { id } = req.params;
        const success = await deleteMedicationHistory(id);
        if (success) res.status(200).json({ message: "Record deleted" });
        else res.status(400).json({ error: "Failed to delete record" });
    } catch (err) {
        console.error("Error deleting medication record:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    fetchMedicalHistoryByUserId,
    fetchMedicalHistoryById,
    createMedicalHistory,
    modifyMedicalHistory,
    removeMedicalHistory
};
