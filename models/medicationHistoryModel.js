const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Fetch summary of medication history for a user
async function getMedicationHistoryByUserId(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
      SELECT 
        mh.id,
        m.name AS medication_name,
        mh.prescribed_by,
        mh.prescribed_date
      FROM medication_history mh
      JOIN medications m ON mh.medication_id = m.id
      WHERE mh.user_id = @userId
      ORDER BY mh.prescribed_date DESC
    `;

        const request = await connection.request()
            .input("userId", sql.Int, userId);

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching medication history:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}

// Fetch full details of a single medication history record
async function getMedicationHistoryById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
      SELECT 
        mh.id,
        m.name AS medication_name,
        mh.prescribed_date,
        mh.dosage,
        mh.duration_days,
        mh.status,
        mh.notes,
        mh.prescribed_by
      FROM medication_history mh
      JOIN medications m ON mh.medication_id = m.id
      WHERE mh.id = @id
    `;

        const request = await connection.request()
            .input("id", sql.Int, id);

        const result = await request.query(query);
        return result.recordset[0]; // Return a single record
    } catch (error) {
        console.error("Error fetching medication history by ID:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}



module.exports = {
    getMedicationHistoryByUserId,
    getMedicationHistoryById
};
