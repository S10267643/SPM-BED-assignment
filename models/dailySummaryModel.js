const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Generates and stores today's summary if not already exists
async function generateAndStoreDailySummary(userId) {
    const pool = await sql.connect(dbConfig);
    const today = new Date().toISOString().split("T")[0];

    // 1. Check for existing summary
    const existing = await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, today)
        .query(`
            SELECT summaryId FROM daily_summaries
            WHERE userId = @userId AND summaryDate = @summaryDate
        `);

    if (existing.recordset.length > 0) {
        const summaryId = existing.recordset[0].summaryId;

        const entries = await pool.request()
            .input("summaryId", sql.Int, summaryId)
            .query(`
                SELECT medName, time, taken
                FROM daily_summary_entries
                WHERE summaryId = @summaryId
            `);

        return {
            summaryDate: today,
            entries: entries.recordset
        };
    }

    // 2. Get scheduled meds
    const scheduledQuery = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT DISTINCT ums.medId, m.medName, ums.medTime
            FROM user_medication_supply ums
            JOIN medications m ON ums.medId = m.medId
            WHERE ums.userId = @userId
        `);
    const scheduledMeds = scheduledQuery.recordset;

    // 3. Get taken meds today
    const takenQuery = await pool.request()
        .input("userId", sql.Int, userId)
        .input("logDate", sql.Date, today)
        .query(`
            SELECT DISTINCT medId
            FROM medication_logs
            WHERE userId = @userId AND logDate = @logDate
        `);
    const takenMedIds = new Set(takenQuery.recordset.map(row => row.medId));

    // 4. Insert summary record
    const insertSummary = await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, today)
        .query(`
            INSERT INTO daily_summaries (userId, summaryDate)
            OUTPUT INSERTED.summaryId
            VALUES (@userId, @summaryDate)
        `);
    const summaryId = insertSummary.recordset[0].summaryId;

    // 5. Insert entries
    for (const med of scheduledMeds) {
        const taken = takenMedIds.has(med.medId) ? 1 : 0;

        await pool.request()
            .input("summaryId", sql.Int, summaryId)
            .input("medId", sql.Int, med.medId)
            .input("medName", sql.NVarChar(100), med.medName)
            .input("time", sql.NVarChar(10), med.medTime)
            .input("taken", sql.Bit, taken)
            .query(`
                INSERT INTO daily_summary_entries (summaryId, medId, medName, time, taken)
                VALUES (@summaryId, @medId, @medName, @time, @taken)
            `);
    }

    // 6. Clean up old summaries
    await cleanOldSummaries();

    return {
        message: "Summary generated and saved",
        summaryDate: today,
        entries: scheduledMeds.map(med => ({
            medName: med.medName,
            time: med.medTime,
            taken: takenMedIds.has(med.medId)
        }))
    };
}

// Deletes entries older than 2 days
async function cleanOldSummaries() {
    const pool = await sql.connect(dbConfig);
    await pool.request().query(`
        DELETE FROM daily_summary_entries
        WHERE summaryId IN (
            SELECT summaryId FROM daily_summaries
            WHERE summaryDate < CAST(DATEADD(DAY, -2, GETDATE()) AS DATE)
        );

        DELETE FROM daily_summaries
        WHERE summaryDate < CAST(DATEADD(DAY, -2, GETDATE()) AS DATE);
    `);
}

// Fetch summary by date
async function getSummaryByDate(userId, date) {
    const pool = await sql.connect(dbConfig);

    const summaryResult = await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, date)
        .query(`
            SELECT summaryId, summaryDate
            FROM daily_summaries
            WHERE userId = @userId AND summaryDate = @summaryDate
        `);

    if (summaryResult.recordset.length === 0) return null;

    const summary = summaryResult.recordset[0];

    const entriesResult = await pool.request()
        .input("summaryId", sql.Int, summary.summaryId) //  This is required
        .query(`
            SELECT medName, time, taken
            FROM daily_summary_entries  -- Use correct table
            WHERE summaryId = @summaryId
        `);

    return {
        summaryDate: summary.summaryDate,
        entries: entriesResult.recordset
    };
}


module.exports = {
    generateAndStoreDailySummary,
    cleanOldSummaries,
    getSummaryByDate
};
