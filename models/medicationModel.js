const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function addMedicine(medicationData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO user_medication_supply 
      (userId, medId, pillsLeft, dosage, refillThreshold, supplyQuantity, medTime, medDayOfWeek, createDate)
      VALUES (@userId, @medId, @pillsLeft, @dosage, @refillThreshold, @supplyQuantity, @medTime, @medDayOfWeek, @createDate)
    `;
    
    const request = connection.request()
      .input("userId", medicationData.userId)
      .input("medId", medicationData.medId)
      .input("pillsLeft", medicationData.pillsLeft)
      .input("dosage", medicationData.dosage)
      .input("refillThreshold", medicationData.refillThreshold)
      .input("supplyQuantity", medicationData.supplyQuantity)
      .input("medTime", medicationData.medTime)
      .input("medDayOfWeek", medicationData.medDayOfWeek)
      .input("createDate", new Date());

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
      SELECT supplyId, userId, medId, pillsLeft, dosage, refillThreshold, supplyQuantity, medTime, medDayOfWeek, createDate
      FROM user_medication_supply
      ORDER BY createDate DESC
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

async function getAllMedicationsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT 
        s.supplyId,
        s.userId,
        m.medName AS medication_name,
        s.dosage,
        s.medTime AS medication_time,
        s.medDayOfWeek,
        s.pillsLeft,
        s.refillThreshold,
        s.supplyQuantity,
        s.createDate
      FROM user_medication_supply s
      JOIN medications m ON s.medId = m.medId
      WHERE s.userId = @userId
      ORDER BY s.createDate DESC
    `;
    
    const request = connection.request()
      .input("userId", userId);

    const result = await request.query(query);
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
    const query = `
      SELECT supplyId, userId, medId, pillsLeft, dosage, refillThreshold, supplyQuantity, medTime, medDayOfWeek, createDate
      FROM user_medication_supply
      WHERE supplyId = @supplyId
    `;
    
    const request = connection.request()
      .input("supplyId", supplyId);

    const result = await request.query(query);
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function updateMedicine(supplyId, medicationData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE user_medication_supply 
      SET medId = @medId,
          pillsLeft = @pillsLeft,
          dosage = @dosage,
          refillThreshold = @refillThreshold,
          supplyQuantity = @supplyQuantity,
          medTime = @medTime,
          medDayOfWeek = @medDayOfWeek
      WHERE supplyId = @supplyId
    `;
    
    const request = connection.request()
      .input("supplyId", supplyId)
      .input("medId", medicationData.medId)
      .input("pillsLeft", medicationData.pillsLeft)
      .input("dosage", medicationData.dosage)
      .input("refillThreshold", medicationData.refillThreshold)
      .input("supplyQuantity", medicationData.supplyQuantity)
      .input("medTime", medicationData.medTime)
      .input("medDayOfWeek", medicationData.medDayOfWeek);

    await request.query(query);
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
    const query = `DELETE FROM user_medication_supply WHERE supplyId = @supplyId`;
    
    const request = connection.request().input("supplyId", supplyId);
    await request.query(query);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function updatePillsLeft(supplyId, pillsConsumed) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE user_medication_supply 
      SET pillsLeft = pillsLeft - @pillsConsumed
      WHERE supplyId = @supplyId AND pillsLeft >= @pillsConsumed
    `;
    
    const request = connection.request()
      .input("supplyId", supplyId)
      .input("pillsConsumed", pillsConsumed);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getMedicationsNeedingRefill(userId = null) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    let query = `
      SELECT supplyId, userId, medId, pillsLeft, dosage, refillThreshold, supplyQuantity, medTime, medDayOfWeek, createDate
      FROM user_medication_supply
      WHERE pillsLeft <= refillThreshold
    `;
    
    const request = connection.request();
    
    if (userId) {
      query += ` AND userId = @userId`;
      request.input("userId", userId);
    }
    
    query += ` ORDER BY pillsLeft ASC`;

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
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
  updatePillsLeft,
  getMedicationsNeedingRefill
};
