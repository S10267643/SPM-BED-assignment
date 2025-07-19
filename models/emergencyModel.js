const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllContacts() {
  const conn = await sql.connect(dbConfig);
  const result = await conn.query("SELECT * FROM emergency_contacts");
  return result.recordset;
}

async function addContact(name, phone) {
  const conn = await sql.connect(dbConfig);
  await conn.query`INSERT INTO emergency_contacts (name, phone) VALUES (${name}, ${phone})`;
}

async function updateContact(id, name, phone) {
  const conn = await sql.connect(dbConfig);
  await conn.query`UPDATE emergency_contacts SET name=${name}, phone=${phone} WHERE id=${id}`;
}

async function deleteContact(id) {
  const conn = await sql.connect(dbConfig);
  await conn.query`DELETE FROM emergency_contacts WHERE id=${id}`;
}

module.exports = { getAllContacts, addContact, updateContact, deleteContact };
