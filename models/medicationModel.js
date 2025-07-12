const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(medicationData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        INSERT INTO medication_schedule (user_id, medication_name, dosage, time, day_of_week)
        VALUES (@user_id, @medication_name, @dosage, @time, @day_of_week)
      `;
    
    const request = connection.request()
      .input("user_id", medicationData.user_id)
      .input("medication_name", medicationData.medication_name)
      .input("dosage", medicationData.dosage)
      .input("time", medicationData.medication_time)
      .input("day_of_week", medicationData.day_of_week);

    await request.query(query);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { addMedicine };