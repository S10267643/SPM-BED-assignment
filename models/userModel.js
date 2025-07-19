const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");

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
    const result = await request.query("SELECT * FROM users WHERE userId = @id");
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
      INSERT INTO users (name, email, phone, password, preferredLanguage, role)
      VALUES (@name, @email, @phone, @password, @preferredLanguage, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = connection.request()
      .input("name", userData.name)
      .input("email", userData.email)
      .input("phone", userData.phone)
      .input("password", userData.password)
      .input("preferredLanguage", userData.preferredLanguage || "English")
      .input("role", userData.role);


    const result = await request.query(query);
    const newUserId = result.recordset[0].id;
    return await getUserById(newUserId);
    } catch (error) {
    // Check for SQL Server unique constraint violation (error number 2627)
    if (error.number === 2627) {
      // Determine which constraint was violated
      if (error.message.includes("UQ__users__email")) {
        const err = new Error("This email is already registered. Try logging in.");
        err.statusCode = 400;
        throw err;
      } else if (error.message.includes("UQ_users_name")) {
        const err = new Error("This name is already taken. Please choose another.");
        err.statusCode = 400;
        throw err;
      } else {
        console.error("Unique constraint violation:", error.message);
        const err = new Error("Duplicate information detected.");
        err.statusCode = 400;
        throw err;
      }
    }
    throw error;
  }
}


async function findUserByEmail(email) {

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("email", email);
    const result = await request.query(`
  SELECT userId, name, email, password, role 
  FROM users 
  WHERE email = @email
`);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Find user by username
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("name", username);
    const result = await request.query("SELECT * FROM users WHERE name = @name");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function authenticateUser(email, plainPassword) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null; // No user found
  }

  const isMatch = await bcrypt.compare(plainPassword, user.password);
  if (!isMatch) {
    return null; // Password doesn't match
  }

  return user;
}

async function storeOTP(email, otp, expiresAt) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO password_reset_otps (email, otp, expires_at)
      VALUES (@Email, @Otp, @ExpiresAt);
    `;
    await connection.request()
      .input("Email", email)
      .input("Otp", otp)
      .input("ExpiresAt", expiresAt)
      .query(query);
  } finally {
    if (connection) await connection.close();
  }
}

async function getOTPRecord(email) {
  const connection = await sql.connect(dbConfig);
  const result = await connection.request()
    .input("email", sql.VarChar, email)
    .query(`
      SELECT TOP 1 otp, expires_at 
      FROM password_reset_otps 
      WHERE email = @email 
      ORDER BY created_at DESC
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return {
    storedOtp: result.recordset[0].otp,
    otpExpirationTime: new Date(result.recordset[0].expires_at).getTime()
  };
}


async function deleteOTP(email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await connection.request()
      .input("Email", email)
      .query("DELETE FROM password_reset_otps WHERE email = @Email");
  } finally {
    if (connection) await connection.close();
  }
}

async function resetPassword(email, newPassword) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await connection.request()
      .input("Email", email)
      .input("Password", hashedPassword)
      .query("UPDATE users SET password = @Password WHERE email = @Email");

    // Delete any OTPs after password reset for security
    await deleteOTP(email);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  findUserByEmail,
  getUserByUsername,
  authenticateUser,
  storeOTP,
  getOTPRecord,
  deleteOTP,
  resetPassword,
};
