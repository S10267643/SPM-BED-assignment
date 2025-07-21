const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all emergency contacts for a specific user
async function getAllEmergencyContactsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT * FROM emergency_contacts
        WHERE userId = @userId
        ORDER BY contactName
      `);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Create new emergency contact
async function createEmergencyContact(contactData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO emergency_contacts
        (contactName, phoneNumber, relationship, userId)
      VALUES 
        (@contactName, @phoneNumber, @relationship, @userId);
      SELECT SCOPE_IDENTITY() AS contactId;
    `;

    const request = connection.request()
      .input("contactName", sql.VarChar, contactData.contactName)
      .input("phoneNumber", sql.VarChar, contactData.phoneNumber)
      .input("relationship", sql.VarChar, contactData.relationship)
      .input("userId", sql.Int, contactData.userId);

    const result = await request.query(query);
    return result.recordset[0].contactId;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Get emergency contact by ID
async function getEmergencyContactById(contactId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request()
      .input("contactId", sql.Int, contactId);
    const result = await request.query(`
      SELECT contactId, contactName, phoneNumber, relationship
      FROM emergency_contacts
      WHERE contactId = @contactId
    `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Update emergency contact
async function updateEmergencyContact(contactId, contactData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request()
      .input("contactId", sql.Int, contactId)
      .input("contactName", sql.VarChar, contactData.contactName)
      .input("phoneNumber", sql.VarChar, contactData.phoneNumber)
      .input("relationship", sql.VarChar, contactData.relationship);

    const result = await request.query(`
      UPDATE emergency_contacts
      SET 
        contactName = @contactName,
        phoneNumber = @phoneNumber,
        relationship = @relationship
      WHERE contactId = @contactId
    `);

    if (result.rowsAffected[0] === 0) {
      const err = new Error("Contact not found");
      err.statusCode = 404;
      throw err;
    }

    return await getEmergencyContactById(contactId);
  } catch (error) {
    if (error.number === 2627) {
      const err = new Error("Phone number already exists in contacts");
      err.statusCode = 400;
      throw err;
    }
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Delete emergency contact
async function deleteEmergencyContact(contactId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request()
      .input("contactId", sql.Int, contactId);

    const result = await request.query(`
      DELETE FROM emergency_contacts
      WHERE contactId = @contactId
    `);

    if (result.rowsAffected[0] === 0) {
      const err = new Error("Contact not found");
      err.statusCode = 404;
      throw err;
    }

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function findDuplicateContact(userId, contactName, phoneNumber) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input('userId', sql.Int, userId)
      .input('contactName', sql.NVarChar, contactName)
      .input('phoneNumber', sql.VarChar, phoneNumber)
      .query(`
        SELECT * FROM emergency_contacts
        WHERE userId = @userId AND (contactName = @contactName OR phoneNumber = @phoneNumber)
      `);
    return result.recordset;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function findContactByPhone(phoneNumber) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("phoneNumber", sql.VarChar(15), phoneNumber)
      .query(`
        SELECT * FROM emergency_contacts 
        WHERE phoneNumber = @phoneNumber
      `);
    return result.recordset[0];
    console.error("Database error (findContactByPhone):", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function findContactByName(userId, contactName) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("userId", sql.Int, userId)
      .input("contactName", sql.NVarChar, contactName)
      .query(`
        SELECT * FROM emergency_contacts
        WHERE userId = @userId AND contactName = @contactName
      `);
    return result.recordset[0]; // return first matching contact or undefined
  } catch (error) {
    console.error("Database error in findContactByName:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllEmergencyContactsByUserId,
  createEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
  findDuplicateContact,
  findContactByPhone,
  findContactByName
};