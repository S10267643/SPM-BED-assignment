const sql = require("mssql");
const config = require("../dbConfig");

async function getNotificationByUserId(userId) {
  await sql.connect(config);
  const result = await sql.query`
    SELECT TOP 1 * FROM custom_notifications WHERE user_id = ${userId}
  `;
  return result.recordset.length > 0 ? result.recordset[0] : null;
}

async function insertNotification({ userId, ringtone, vibration, repeat, youtube }) {
  await sql.connect(config);
  await sql.query`
    INSERT INTO custom_notifications (user_id, ringtone_name, vibration_type, repeat_count, youtube_link)
    VALUES (${userId}, ${ringtone}, ${vibration}, ${repeat}, ${youtube})
  `;
}

async function updateNotification({ userId, ringtone, vibration, repeat, youtube }) {
  await sql.connect(config);
  await sql.query`
    UPDATE custom_notifications SET
      ringtone_name = ${ringtone},
      vibration_type = ${vibration},
      repeat_count = ${repeat},
      youtube_link = ${youtube}
    WHERE user_id = ${userId}
  `;
}

async function deleteNotification(userId) {
  await sql.connect(config);
  await sql.query`
    DELETE FROM custom_notifications WHERE user_id = ${userId}
  `;
}

module.exports = {
  getNotificationByUserId,
  insertNotification,
  updateNotification,
  deleteNotification
};
