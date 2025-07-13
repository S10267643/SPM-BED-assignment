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

async function getAllMedications() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        SELECT id, medication_name, dosage, time, day_of_week 
        FROM medication_schedule
        ORDER BY day_of_week, time
        WHERE user_id = @user_id
      `;
    
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getMedicationById(medicationId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        SELECT id, medication_name, dosage, time, day_of_week 
        FROM medication_schedule
        WHERE id = @id
      `;
    
    const request = connection.request()
      .input("id", medicationId);

    const result = await request.query(query);
    return result.recordset[0]; // Return the first (and only) record
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function updateMedicine(medicationId, medicationData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        UPDATE medication_schedule 
        SET medication_name = @medication_name,
            dosage = @dosage,
            time = @time,
            day_of_week = @day_of_week
        WHERE id = @id
      `;
    
    const request = connection.request()
      .input("id", medicationId)
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

async function deleteMedicine(medicationId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
        DELETE FROM medication_schedule 
        WHERE id = @id
      `;
    
    const request = connection.request()
      .input("id", medicationId);

    await request.query(query);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { addMedicine, getAllMedications, getMedicationById, updateMedicine, deleteMedicine };