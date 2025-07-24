const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getMessagesByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT * FROM messages 
      WHERE elderlyId = ${userId} OR caregiverId = ${userId}
      ORDER BY timestamp DESC
    `;
    return result.recordset;
  } catch (err) {
    console.error("Error getting messages:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function getConversation(elderlyId, caregiverId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT m.*, 
        e.name as elderlyName, 
        c.name as caregiverName
      FROM messages m
      JOIN users e ON m.elderlyId = e.userId
      JOIN users c ON m.caregiverId = c.userId
      WHERE (m.elderlyId = ${elderlyId} AND m.caregiverId = ${caregiverId})
         OR (m.elderlyId = ${caregiverId} AND m.caregiverId = ${elderlyId})
      ORDER BY m.timestamp ASC
    `;
    return result.recordset;
  } catch (err) {
    console.error("Error getting conversation:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function createMessage({ elderlyId, caregiverId, message }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO messages (elderlyId, caregiverId, message)
      VALUES (${elderlyId}, ${caregiverId}, ${message})
    `;
  } catch (err) {
    console.error("Error creating message:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function updateMessage(messageId, message) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await sql.query`
      UPDATE messages
      SET message = ${message}
      WHERE messageId = ${messageId}
      SELECT * FROM messages WHERE messageId = ${messageId}
    `;
    return result.recordset[0];
  } catch (err) {
    console.error("Error updating message:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function deleteMessage(messageId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await sql.query`
      DELETE FROM messages
      WHERE messageId = ${messageId}
    `;
  } catch (err) {
    console.error("Error deleting message:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

async function getMessagesForCaregiver(caregiverId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT m.*, u.name as elderlyName
      FROM messages m
      JOIN users u ON m.elderlyId = u.userId
      WHERE m.caregiverId = ${caregiverId}
      ORDER BY m.timestamp DESC
    `;
    return result.recordset;
  } catch (err) {
    console.error("Error getting caregiver messages:", err);
    throw err;
  } finally {
    if (connection) connection.close();
  }
}

module.exports = {
  getMessagesByUserId,
  getConversation,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessagesForCaregiver
};