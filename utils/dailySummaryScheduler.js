// utils/dailySummaryScheduler.js
const cron = require("node-cron");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { generateAndStoreDailySummary } = require("../models/dailySummaryModel");

// Run every day at 11:59 PM
cron.schedule("59 23 * * *", async () => {
    console.log("Running daily summary job at 11:59 PM...");

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT userId FROM users");
        const users = result.recordset;

        for (const user of users) {
            await generateAndStoreDailySummary(user.userId);
        }

        console.log("Daily summaries generated for all users.");
    } catch (err) {
        console.error("Error running daily summary job:", err);
    }
});
