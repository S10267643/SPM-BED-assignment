const {
    generateDailySummary,
    getSummaryByDate
} = require("../models/dailySummaryModel");

// Elderly: generate or view today's summary
async function getDailySummary(req, res) {
    try {
        const userId = req.user.userId;
        const result = await generateDailySummary(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error generating daily summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Elderly: view past summary by date
async function getUserSummaryByDate(req, res) {
    try {
        const userId = req.user.userId;
        const date = req.query.date;
        if (!date) return res.status(400).json({ error: "Date parameter is required" });

        const result = await getSummaryByDate(userId, date);
        if (!result) return res.status(404).json({ message: "No summary found for that date" });

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching summary by date:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}


async function getElderlySummaryByDate(req, res) {
    try {
        const userId = parseInt(req.params.userId);  // 
        const date = req.query.date;

        if (!date) return res.status(400).json({ error: "Date parameter is required" });

        const result = await getSummaryByDate(userId, date);
        if (!result) return res.status(404).json({ message: "No summary found for that date" });

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching elderly summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {
    getDailySummary,
    getUserSummaryByDate,
    getElderlySummaryByDate
};
