const MessageModel = require("../models/messagesModel");

async function getMessages(req, res) {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: "Missing or invalid userId" });

  try {
    const messages = await MessageModel.getMessagesByUserId(userId);
    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function getConversation(req, res) {
  const elderlyId = parseInt(req.params.elderlyId);
  const caregiverId = parseInt(req.params.caregiverId);
  
  if (!elderlyId || !caregiverId) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  try {
    const conversation = await MessageModel.getConversation(elderlyId, caregiverId);
    res.json(conversation);
  } catch (err) {
    console.error("Get Conversation Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function sendMessage(req, res) {
  const { elderlyId, caregiverId, message } = req.body;
  
  if (!elderlyId || !caregiverId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await MessageModel.createMessage({ elderlyId, caregiverId, message });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).send("Internal Server Error");
  }
}


async function editMessage(req, res) {
  const messageId = parseInt(req.params.messageId);
  const { message } = req.body;
  
  if (!messageId || !message) {
    return res.status(400).json({ error: "Missing message ID or content" });
  }

  try {
    const updatedMessage = await MessageModel.updateMessage(messageId, message);
    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message updated successfully" });
  } catch (err) {
    console.error("Edit Message Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteMessage(req, res) {
  const messageId = parseInt(req.params.messageId);
  if (!messageId) return res.status(400).json({ error: "Missing message ID" });

  try {
    await MessageModel.deleteMessage(messageId);
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete Message Error:", err);
    res.status(500).send("Internal Server Error");
  }
}


module.exports = {
  getMessages,
  getConversation,
  sendMessage,
  deleteMessage,
  editMessage
};