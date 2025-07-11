const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(data) {
  const pool = await sql.connect(dbConfig);
  const { user_id, medication_name, medication_time, medication_prescription, medication_day } = data;

  const query = `
    INSERT INTO medication_schedule 
    (user_id, medication_name, medication_time, medication_prescription, medication_day)
    VALUES (@user_id, @medication_name, @time, @doseage, @day_of_week)
  `;

  await pool.request()
    .input("user_id", sql.Int, user_id)
    .input("medication_name", sql.VarChar, medication_name)
    .input("time", sql.VarChar, medication_time)
    .input("doseage", sql.VarChar, medication_prescription)
    .input("day_of_the_week", sql.Int, medication_day)
    .query(query);
}

async function getAllMedications() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM medication_schedule");
  return result.recordset;
}

module.exports = { addMedicine, getAllMedications };