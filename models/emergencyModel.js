const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all emergency contacts
async function getAllEmergencyContactsByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT * FROM emergency_contact 
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
      INSERT INTO emergency_contact 
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
      FROM emergency_contact
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
      UPDATE emergency_contact
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
      DELETE FROM emergency_contact
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


module.exports = {
  getAllEmergencyContactsByUser,
  createEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
};