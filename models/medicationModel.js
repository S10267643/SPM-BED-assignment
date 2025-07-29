const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(data) {
  let connection;

  try {
    connection = await sql.connect(dbConfig);
    
    //Validate foreign keys
    const userCheck = await connection.request()
      .input("userId", data.userId)
      .query("SELECT userId FROM users WHERE userId = @userId");
    
    if (userCheck.recordset.length === 0) {
      throw new Error("User not found");
    }

    const medCheck = await connection.request()
      .input("medId", data.medId)
      .query("SELECT medId FROM medications WHERE medId = @medId");
    
    if (medCheck.recordset.length === 0) {
      throw new Error("Medication not found");
    }

    //Check for duplicate medication for same user
    const duplicateCheck = await connection.request()
      .input("userId", data.userId)
      .input("medId", data.medId)
      .query("SELECT supplyId FROM user_medication_supply WHERE userId = @userId AND medId = @medId");
    
    if (duplicateCheck.recordset.length > 0) {
      throw new Error("This medication is already assigned to this user");
    }

    const query = `
      INSERT INTO user_medication_supply (userId, medId, dosage, refillThreshold, supplyQuantity, pillsLeft, medTime, medDayOfWeek, createDate)
      VALUES (@userId, @medId, @dosage, @refillThreshold, @supplyQuantity, @pillsLeft, @medTime, @medDayOfWeek, @createDate)
    `;

    const request = connection.request()
      .input("userId", data.userId)
      .input("medId", data.medId)
      .input("dosage", data.dosage)
      .input("refillThreshold", data.refillThreshold)
      .input("supplyQuantity", data.supplyQuantity)
      .input("pillsLeft", data.supplyQuantity) 
      .input("medTime", data.medication_time)  
      .input("medDayOfWeek", data.day_of_week) 
      .input("createDate", new Date());

    const result = await request.query(query);
    
    return { success: true, rowsAffected: result.rowsAffected[0] };
    
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
    const result = await connection.request().query(`
      SELECT supplyId, userId, medId, dosage, refillThreshold, supplyQuantity, pillsLeft, medTime, medDayOfWeek, createDate
      FROM user_medication_supply
      ORDER BY createDate DESC
    `);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getAllMedicationsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("userId", userId)
      .query(`
        SELECT s.supplyId, s.userId, s.medId, m.medName AS medication_name, s.dosage, s.medTime AS medication_time, s.medDayOfWeek, s.refillThreshold, s.supplyQuantity, s.pillsLeft, s.createDate
        FROM user_medication_supply s
        JOIN medications m ON s.medId = m.medId
        WHERE s.userId = @userId
        ORDER BY s.createDate DESC`
      );
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getMedicationById(supplyId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("supplyId", supplyId)
      .query(`
        SELECT supplyId, userId, medId, dosage, refillThreshold, supplyQuantity, pillsLeft, medTime, medDayOfWeek, createDate
        FROM user_medication_supply
        WHERE supplyId = @supplyId
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function updateMedicine(supplyId, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Check if record exists first
    const existsCheck = await connection.request()
      .input("supplyId", supplyId)
      .query("SELECT supplyId FROM user_medication_supply WHERE supplyId = @supplyId");
    
    if (existsCheck.recordset.length === 0) {
      throw new Error("Medication record not found");
    }

    // Validate medId exists
    const medCheck = await connection.request()
      .input("medId", data.medId)
      .query("SELECT medId FROM medications WHERE medId = @medId");
    
    if (medCheck.recordset.length === 0) {
      throw new Error("Medication not found");
    }

    const query = `
      UPDATE user_medication_supply 
      SET medId = @medId, dosage = @dosage, refillThreshold = @refillThreshold, supplyQuantity = @supplyQuantity, medTime = @medTime, medDayOfWeek = @medDayOfWeek
      WHERE supplyId = @supplyId
    `;

    const request = connection.request()
      .input("supplyId", supplyId)
      .input("medId", data.medId)
      .input("dosage", data.dosage)
      .input("refillThreshold", data.refillThreshold)
      .input("supplyQuantity", data.supplyQuantity)
      .input("medTime", data.medication_time)
      .input("medDayOfWeek", data.day_of_week);

    const result = await request.query(query);
    
    if (result.rowsAffected[0] === 0) {
      throw new Error("No rows were updated");
    }
    
    return { success: true, rowsAffected: result.rowsAffected[0] };
    
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteMedicine(supplyId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Check if record exists first
    const existsCheck = await connection.request()
      .input("supplyId", supplyId)
      .query("SELECT supplyId FROM user_medication_supply WHERE supplyId = @supplyId");
    
    if (existsCheck.recordset.length === 0) {
      throw new Error("Medication record not found");
    }

    const result = await connection.request()
      .input("supplyId", supplyId)
      .query("DELETE FROM user_medication_supply WHERE supplyId = @supplyId");
    
    return { success: true, rowsAffected: result.rowsAffected[0] };
    
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getAllMedicationNames() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query(`
      SELECT medId, medName FROM medications ORDER BY medName
    `);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching medication names:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  addMedicine,
  getAllMedications,
  getAllMedicationsByUserId,
  getMedicationById,
  updateMedicine,
  deleteMedicine,
  getAllMedicationNames
};