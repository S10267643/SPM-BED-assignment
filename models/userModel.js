const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all users
async function getAllUsers() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query("SELECT * FROM users");
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Get user by ID
async function getUserById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("id", id);
    const result = await request.query("SELECT * FROM users WHERE user_id = @id");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Create user
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO users (name, email, phone, password, preferred_language)
      VALUES (@name, @email, @phone, @password, @preferred_language);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = connection.request()
      .input("name", userData.name)
      .input("email", userData.email)
      .input("phone", userData.phone)
      .input("password", userData.password)
      .input("preferred_language", userData.preferred_language || "English");

    const result = await request.query(query);
    const newUserId = result.recordset[0].id;
    return await getUserById(newUserId);
    } catch (error) {
    if (error.message.includes("Violation of UNIQUE KEY constraint")) {
      const err = new Error("Email already exists");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
