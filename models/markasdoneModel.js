const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function createMedicationLog(userId, medId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO medication_logs (userId, medId, logDate)
      VALUES (${userId}, ${medId}, GETDATE())
    `;
  } catch (err) {
    console.error("Error creating medication log:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function deleteMedicationLog(userId, medId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await sql.query`
      DELETE FROM medication_logs
      WHERE userId = ${userId} AND medId = ${medId}
    `;
  } catch (err) {
    console.error("Error deleting medication log:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

module.exports = {
  createMedicationLog,
  deleteMedicationLog
};