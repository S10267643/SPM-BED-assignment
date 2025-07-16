const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getNotificationByUserId(userId) {
  let connection;
  connection = await sql.connect(dbConfig);
  const result = await sql.query`
    SELECT TOP 1 * FROM custom_notifications WHERE userId = ${userId}
  `;
  return result.recordset.length > 0 ? result.recordset[0] : null;
}

async function insertNotification({ userId, title, enableNotification, youtube }) {
  let connection;
  connection = await sql.connect(dbConfig);
  await sql.query`
    INSERT INTO custom_notifications (userId, title, enableNotification, youtube_link)
    VALUES (${userId}, ${title}, ${enableNotification}, ${youtube})
  `;
}

async function updateNotification({ userId, title, enableNotification, youtube}) {
  await sql.connect(dbConfig);
  await sql.query`
    UPDATE custom_notifications SET
      title = ${title},
      enableNotification = ${enableNotification},
      youtube_link = ${youtube}
    WHERE user_id = ${userId}
  `;
}

async function deleteNotification(userId) {
  await sql.connect(config);
  await sql.query`
    DELETE FROM custom_notifications WHERE userId = ${userId}
  `;
}

module.exports = {
  getNotificationByUserId,
  insertNotification,
  updateNotification,
  deleteNotification
};
