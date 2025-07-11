const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(data) {
  const pool = await sql.connect(dbConfig);
  const { user_id, medication_name, medication_time, dosage, day_of_week } = data;

  const query = `
    INSERT INTO medication_schedule 
    (user_id, medication_name, medication_time, dosage, medication_day)
    VALUES (@user_id, @medication_name, @time, @dosage, @day_of_week)
  `;

  await pool.request()
    .input("user_id", sql.Int, user_id)
    .input("medication_name", sql.VarChar, medication_name)
    .input("time", sql.VarChar, medication_time)
    .input("dosage", sql.VarChar, dosage)
    .input("day_of_week", sql.Int, day_of_week)
    .query(query);
}

async function getAllMedications() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM medication_schedule");
  return result.recordset;
}

module.exports = { addMedicine, getAllMedications };