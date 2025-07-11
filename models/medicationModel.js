const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(MedicineData) {
  const { user_id, medication_name, medication_time, medication_prescription, medication_day } = MedicineData;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
      INSERT INTO medication_schedule (user_id, medication_name, day_of_week, time, dosage)
      VALUES (@user_id, @medication_name, @day_of_week, @time, @dosage);
    `;

    await connection.request()
      .input("user_id", sql.Int, user_id)
      .input("medication_name", sql.VarChar(50), medication_name)
      .input("day_of_week", sql.TinyInt, medication_day)
      .input("time", sql.Time, medication_time)
      .input("dosage", sql.VarChar(100), medication_prescription)
      .query(query);

    return { message: `Inserted for day ${medication_day}` };
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { addMedicine };


async function updateMedicine(MedicineData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE medication_schedule
      SET user_id = @user_id,
          medication_name = @medication_name,
          medication_time = @medication_time,
          medication_prescription = @medication_prescription
      WHERE id = @id;
    `;

    const request = connection.request()
      .input("id", MedicineData.id)  // unique identifier of the medication to update
      .input("user_id", MedicineData.user_id)
      .input("medication_name", MedicineData.medication_name)
      .input("medication_time", MedicineData.medication_time)
      .input("medication_prescription", MedicineData.medication_prescription);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      const err = new Error("No medication found with the specified id.");
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    if (error.number === 515) {
      const err = new Error("A required field is missing. Please fill in all fields.");
      err.statusCode = 400;
      throw err;
    }
    console.error("Unhandled SQL error:", error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteMedicine(medicineId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
      DELETE FROM medication_schedule
      WHERE id = @id;
    `;

    const request = connection.request().input("id", sql.Int, medicineId);

    const result = await request.query(query);

    // Optional: Check if a row was actually deleted
    if (result.rowsAffected[0] === 0) {
      const err = new Error("No medication found with the specified id.");
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    if (error.number === 547) {
      const err = new Error("This medication cannot be deleted due to related records.");
      err.statusCode = 400;
      throw err;
    }

    console.error("Unhandled SQL error:", error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

