const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getMedicationHistoryByUserId(userId) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
      SELECT 
        mh.historyId,
        mh.dosage,
        m.medName AS medication_name
      FROM medication_history mh
      JOIN medications m ON mh.medId = m.medId
      WHERE mh.userId = @userId
    `);
    return result.recordset;
}

async function getMedicationHistoryById(id) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
      SELECT 
        m.medName AS medication_name,
        mh.dosage,
        mh.notes
      FROM medication_history mh
      JOIN medications m ON mh.medId = m.medId
      WHERE mh.historyId = @id
    `);
    return result.recordset[0];
}

async function addMedicationHistory(data) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("userId", sql.Int, data.userId)
        .input("medId", sql.Int, data.medId)
        .input("dosage", sql.VarChar(50), data.dosage)
        .input("pillsLeft", sql.Int, data.pillsLeft)
        .input("notes", sql.Text, data.notes)
        .query(`
      INSERT INTO medication_history (
        userId, medId, dosage, pillsLeft, notes
      ) VALUES (
        @userId, @medId, @dosage, @pillsLeft, @notes
      )
    `);
    return result.rowsAffected[0] > 0;
}

async function updateMedicationHistory(id, data) {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("id", sql.Int, id);

    const typeMap = {
        userId: sql.Int,
        medId: sql.Int,
        dosage: sql.VarChar(50),
        pillsLeft: sql.Int,
        prescribed_by: sql.VarChar(50),
        prescribed_date: sql.Date,
        duration: sql.Int,
        status: sql.VarChar(50),
        notes: sql.Text,
    };

    for (const [key, value] of Object.entries(data)) {
        if (typeMap[key]) {
            request.input(key, typeMap[key], value);
        }
    }

    const sets = Object.keys(data).map(key => `${key} = @${key}`).join(", ");
    const result = await request.query(`UPDATE medication_history SET ${sets} WHERE historyId = @id`);
    return result.rowsAffected[0] > 0;
}

async function deleteMedicationHistory(id) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("DELETE FROM medication_history WHERE historyId = @id");
    return result.rowsAffected[0] > 0;
}

module.exports = {
    getMedicationHistoryByUserId,
    getMedicationHistoryById,
    addMedicationHistory,
    updateMedicationHistory,
    deleteMedicationHistory
};
