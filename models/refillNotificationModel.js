const sql = require("mssql");
const dbConfig = require("../dbConfig");

const getMedicationsBelowThreshold = async (userId) => {
    const pool = await sql.connect(dbConfig);  
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT ums.pillsLeft, ums.refillThreshold, m.medName, u.name, u.email
            FROM user_medication_supply ums
            INNER JOIN medications m ON ums.medId = m.medId
            INNER JOIN users u ON ums.userId = u.userId
            WHERE ums.userId = @userId
        `);

    return result.recordset.filter(med => med.pillsLeft <= med.refillThreshold);
};

const getCaregiverEmails = async () => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .query(`SELECT email FROM users WHERE role = 'Caregiver'`);

    return result.recordset.map(row => row.email);
};

module.exports = {
    getMedicationsBelowThreshold,
    getCaregiverEmails
};
