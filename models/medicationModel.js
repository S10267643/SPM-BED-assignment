const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { request } = require("express");

async function createMedication(medicationData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        INSERT INTO medication_schedule (user_id, medication_name, medication_prescription, medication_time, day_of_week)
        VALUES (@user_id, @medication_name, @dosage, @medication_time, @day_of_week)
      `;
    

    const request = await connection.request()
      .input("user_id", medicationData.user_id)
      .input("medication_name", medicationData.medication_name)
      .input("medication_prescription", medicationData.medication_prescription)
      .input("medication_time", medicationData.medication_time)
      .input("day_of_week", medicationData.day)

      await request.query(query);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { createMedication };
