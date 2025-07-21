const emergencyModel = require("../models/emergencyModel");

// Get all emergency contacts for the logged-in user
async function getAllEmergencyContactsByUser(req, res) {
  try {
    const userId = req.user.userId; // pulled from JWT

    const contacts = await emergencyModel.getAllEmergencyContactsByUserId(userId);
    res.json(contacts);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving emergency contacts" });
  }
}


// Get emergency contact by ID
async function getEmergencyContactById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const contact = await emergencyModel.getEmergencyContactById(id);
    if (!contact) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving emergency contact" });
  }
}

// Create new emergency contact
async function createEmergencyContact(req, res) {
  try {
    const { contactName, phoneNumber, relationship } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!contactName || !phoneNumber || !relationship) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for duplicates
    const duplicates = await emergencyModel.findDuplicateContact(userId, contactName, phoneNumber);
    if (duplicates.length > 0) {
      const duplicate = duplicates[0];
      let conflictField = [];

      if (duplicate.contactName === contactName) {
        conflictField.push("name");
      }
      if (duplicate.phoneNumber === phoneNumber) {
        conflictField.push("phone number");
      }

      // Validate Singapore phone number (starts with 8 or 9, exactly 8 digits)
      if (!/^[89]\d{7}$/.test(phoneNumber)) {
        return res.status(400).json({ error: "Phone number must be 8 digits and start with 8 or 9" });
      }


      return res.status(400).json({
        error: `A contact with this ${conflictField.join(" and ")} already exists.`
      });
    }


    const contactId = await emergencyModel.createEmergencyContact({
      contactName,
      phoneNumber,
      relationship,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Contact created',
      contactId
    });
  } catch (error) {
    console.error('Error:', error);
    
    if (error.number === 547) { // Foreign key violation
      return res.status(400).json({ error: "Invalid user" });
    }
    
    if (error.number === 2627) { // Duplicate key
      return res.status(400).json({ error: "Phone number already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
}

// Update emergency contact by ID
async function updateEmergencyContact(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { contactName, phoneNumber, relationship } = req.body;
    const userId = req.user.userId;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    if (!contactName || !phoneNumber || !relationship) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate phone number format
    if (!/^[89]\d{7}$/.test(phoneNumber)) {
      return res.status(400).json({
        error: "Phone number must be 8 digits and start with 8 or 9",
      });
    }

    const existingContact = await emergencyModel.getEmergencyContactById(id);
    if (!existingContact) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    // Prevent duplicate name
    const nameConflict = await emergencyModel.findContactByName(userId, contactName);
    if (nameConflict && nameConflict.contactId !== id) {
      return res.status(400).json({ error: "Contact name already exists" });
    }

    // Prevent duplicate phone number
    const phoneConflict = await emergencyModel.findContactByPhone(phoneNumber);
    if (phoneConflict && phoneConflict.contactId !== id) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const updatedContact = await emergencyModel.updateEmergencyContact(id, {
      contactName,
      phoneNumber,
      relationship,
    });

    res.json(updatedContact);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating emergency contact" });
  }
}


// Delete emergency contact by ID
async function deleteEmergencyContact(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const result = await emergencyModel.deleteEmergencyContact(id);
    if (!result) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    res.json({ message: "Emergency contact deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting emergency contact" });
  }
}

module.exports = {
  getAllEmergencyContactsByUser,
  getEmergencyContactById,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
};