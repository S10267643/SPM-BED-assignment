// controllers/dailySummaryController.js
const { generateAndStoreDailySummary, getSummaryByDate } = require("../models/dailySummaryModel");

// For authenticated users to view today's daily summary (or generate if not exists)
async function getDailySummary(req, res) {
    try {
        const userId = req.user.userId; // correct key from JWT
        const result = await generateAndStoreDailySummary(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error generating daily summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// For authenticated users to fetch a summary by a specific date
async function getDailySummaryByDate(req, res) {
    try {
        const userId = req.user.userId; // FIX: should be userId, not id
        const date = req.query.date;

        if (!date) {
            return res.status(400).json({ error: "Date parameter is required" });
        }

        const summary = await getSummaryByDate(userId, date);
        if (!summary) {
            return res.status(404).json({ message: "No summary found for this date" });
        }

        res.status(200).json(summary);
    } catch (error) {
        console.error("Error fetching summary by date:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getDailySummary,
    getDailySummaryByDate
};
