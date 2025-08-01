const { sendRefillNotification } = require("../utils/emailSender");
const refillNotificationModel = require("../models/refillNotificationModel");

exports.checkRefillThreshold = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch medications below threshold
        const medicationsToRefill = await refillNotificationModel.getMedicationsBelowThreshold(userId);

        if (!medicationsToRefill || medicationsToRefill.length === 0) {
            return res.status(200).json({ message: "No medications need refilling." });
        }

        // Fetch caregiver emails
        const caregiverEmails = await refillNotificationModel.getCaregiverEmails();

        // Send refill alert email
        await sendRefillNotification({
            elderlyEmail: medicationsToRefill[0].email,
            caregiverEmails,
            elderlyName: medicationsToRefill[0].name,
            medications: medicationsToRefill,
        });

        return res.status(200).json({ message: "Refill notification sent." });
    } catch (error) {
        console.error("Refill notification error:", error);
        return res.status(500).json({ message: "Server error." });
    }
};

