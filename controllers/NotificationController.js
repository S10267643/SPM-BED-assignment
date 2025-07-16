const NotificationModel = require("../models/NotificationModel");

async function getNotification(req, res) {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: "Missing or invalid userId" });

  try {
    const notification = await NotificationModel.getNotificationByUserId(userId);
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    console.error("Get Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function createNotification(req, res) {
  const { userId, title, enableNotification ,youtube } = req.body;
  if (!userId || !title || !enableNotification  == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await NotificationModel.getNotificationByUserId(userId);
    if (existing) {
      // User already has a notification, do not allow duplicate creation
      return res.status(409).json({ error: "Notification already exists. Use update instead." });
    }
    await NotificationModel.insertNotification({ userId, title, enableNotification, youtube });
    res.status(201).json({ message: "Notification created successfully" });
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function editNotification(req, res) {
  const userId = parseInt(req.params.userId);
  const { title, enableNotification, youtube } = req.body;
  if (!userId || !title || !enableNotification  == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await NotificationModel.getNotificationByUserId(userId);
    if (!existing) {
      return res.status(404).json({ error: "Notification not found. Create it first." });
    }
    await NotificationModel.updateNotification({ userId, title, enableNotification, youtube });
    res.json({ message: "Notification updated successfully" });
  } catch (err) {
    console.error("Edit Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteNotification(req, res) {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: "Missing or invalid userId" });

  try {
    const existing = await NotificationModel.getNotificationByUserId(userId);
    if (!existing) {
      return res.status(404).json({ error: "Notification not found." });
    }
    await NotificationModel.deleteNotification(userId);
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getNotification,
  createNotification,
  editNotification,
  deleteNotification,
};
