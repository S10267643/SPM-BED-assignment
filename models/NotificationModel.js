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

async function insertNotification({ userId, title, enable, youtube }) {
  let connection;
  connection = await sql.connect(dbConfig);
  console.log(enable)
if (enable=="true"){
en=1
}
else{
  en=0
}

  await sql.query`
    INSERT INTO custom_notifications (userId, title, enableNotification, youtubeLink)
    VALUES (${userId}, ${title}, ${en}, ${youtube})
  `;
}

async function updateNotification({ userId, title, enable, youtube}) {
  await sql.connect(dbConfig);
  console.log(enable);
  if (enable=="true"){
en=1
}
else{
  en=0
}

  await sql.query`
    UPDATE custom_notifications SET
      title = ${title},
      enableNotification = ${en},
      youtubeLink = ${youtube}
    WHERE userId = ${userId}
  `;
}

async function deleteNotification(userId) {
  await sql.connect(dbConfig);
  await sql.query`
    DELETE FROM custom_notifications WHERE userId = ${userId}
  `;
}



// find the all elderly's med supply where notification is enabled for today, 
async function getMedSupplyAndNotificationEnabled(){
await sql.connect(dbConfig);

//calculate day of week
today = new Date().getDay(); //0 is sunday, 6 is saturday

const result = await sql.query`
    SELECT * FROM user_medication_supply INNER JOIN custom_notifications
    ON user_medication_supply.userId=custom_notifications.userId
    WHERE enableNotification = 1 and medDayOfWeek like '%${today}%'
  `;

}

// find all the med logs for today
async function getAllMedLogsToday(){
  
}


//for each send notification






async function updateNotificationTokenByUserid(userId, notificationToken)  {
  let connection;
  connection = await sql.connect(dbConfig);
console.log(JSON.stringify(notificationToken));
console.log(userId);

   const query = `
        UPDATE custom_Notifications
        SET notificationToken = @notificationToken
        WHERE userId = @userId
      `;
    
    const request = connection.request()
      .input("userId", userId)
      .input("notificationToken", JSON.stringify(notificationToken));
 await request.query(query);
}

module.exports = {
  getNotificationByUserId,
  insertNotification,
  updateNotification,
  deleteNotification,
  //getNotificationEnabledByUserId,
  updateNotificationTokenByUserid
};
