const emergencyModel = require("../models/emergencyModel");

async function getAllContacts(req, res) {
  try {
    const contacts = await emergencyModel.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching contacts" });
  }
}

async function addContact(req, res) {
  try {
    const { name, phone } = req.body;
    await emergencyModel.addContact(name, phone);
    res.status(201).json({ message: "Contact added" });
  } catch (err) {
    res.status(500).json({ error: "Error adding contact" });
  }
}

async function updateContact(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { name, phone } = req.body;
    await emergencyModel.updateContact(id, name, phone);
    res.json({ message: "Contact updated" });
  } catch (err) {
    res.status(500).json({ error: "Error updating contact" });
  }
}

async function deleteContact(req, res) {
  try {
    const id = parseInt(req.params.id);
    await emergencyModel.deleteContact(id);
    res.json({ message: "Contact deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting contact" });
  }
}

module.exports = { getAllContacts, addContact, updateContact, deleteContact };
