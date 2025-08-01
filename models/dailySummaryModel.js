const sql = require("mssql");
const dbConfig = require("../dbConfig");

function formatTime(date) {
    const d = new Date(date);
    return d.toTimeString().split(":").slice(0, 2).join(":"); // "HH:mm"
}

async function generateDailySummary(userId) {
    const pool = await sql.connect(dbConfig);
    const today = new Date().toISOString().split("T")[0];

    // 1. Delete any existing summary for today
    await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, today)
        .query(`
            DELETE FROM daily_summary_entries 
            WHERE summaryId IN (
                SELECT summaryId FROM daily_summaries
                WHERE userId = @userId AND summaryDate = @summaryDate
            );

            DELETE FROM daily_summaries 
            WHERE userId = @userId AND summaryDate = @summaryDate;
        `);

    // 2. Get today's scheduled meds
    const dayOfWeek = new Date().getDay(); // 0 = Sunday
    const scheduled = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT ums.medId, m.medName, ums.medTime
            FROM user_medication_supply ums
            JOIN medications m ON ums.medId = m.medId
            WHERE ums.userId = @userId
              AND (',' + ums.medDayOfWeek + ',' LIKE '%,' + CAST(${dayOfWeek} AS VARCHAR) + ',%')
        `);

    // 3. Get today's logs
    const logs = await pool.request()
        .input("userId", sql.Int, userId)
        .input("logDate", sql.Date, today)
        .query(`
            SELECT medId, LogTime
            FROM medication_logs
            WHERE userId = @userId AND logDate = @logDate
        `);

    const takenSet = new Set(
        logs.recordset.map(log => `${log.medId}-${formatTime(log.LogTime)}`)
    );

    // 4. Insert new summary
    const insert = await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, today)
        .query(`
            INSERT INTO daily_summaries (userId, summaryDate)
            OUTPUT INSERTED.summaryId
            VALUES (@userId, @summaryDate)
        `);

    const summaryId = insert.recordset[0].summaryId;

    // 5. Insert all med/time rows
    for (const { medId, medName, medTime } of scheduled.recordset) {
        const times = medTime.split(",");
        for (const time of times) {
            const taken = takenSet.has(`${medId}-${time}`) ? 1 : 0;

            await pool.request()
                .input("summaryId", sql.Int, summaryId)
                .input("medId", sql.Int, medId)
                .input("medName", sql.NVarChar(255), medName)
                .input("time", sql.VarChar(10), time)
                .input("taken", sql.Bit, taken)
                .query(`
                    INSERT INTO daily_summary_entries (summaryId, medId, medName, time, taken)
                    VALUES (@summaryId, @medId, @medName, @time, @taken)
                `);
        }
    }

    // 6. Cleanup old summaries
    await deleteOldSummaries();

    return await getSummaryByDate(userId, today);
}

async function getSummaryByDate(userId, date) {
    const pool = await sql.connect(dbConfig);

    const summary = await pool.request()
        .input("userId", sql.Int, userId)
        .input("summaryDate", sql.Date, date)
        .query(`
            SELECT summaryId FROM daily_summaries
            WHERE userId = @userId AND summaryDate = @summaryDate
        `);

    if (summary.recordset.length === 0) return null;

    const summaryId = summary.recordset[0].summaryId;

    const entries = await pool.request()
        .input("summaryId", sql.Int, summaryId)
        .query(`
            SELECT medName, time, taken
            FROM daily_summary_entries
            WHERE summaryId = @summaryId
            ORDER BY time
        `);

    return {
        summaryDate: date,
        entries: entries.recordset
    };
}

async function deleteOldSummaries() {
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

module.exports = {
    generateDailySummary,
    getSummaryByDate
};
