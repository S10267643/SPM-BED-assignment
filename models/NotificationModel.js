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

async function insertNotification({ userId, title, enable, imageLink }) {
  let connection;
  connection = await sql.connect(dbConfig);
  console.log(enable);
  if (enable=="true"){
    en=1;
  } else {
    en=0;
  }

  await sql.query`
    INSERT INTO custom_notifications (userId, title, enableNotification, imageLink)
    VALUES (${userId}, ${title}, ${en}, ${imageLink})
  `;
}

async function updateNotification({ userId, title, enable, imageLink}) {
   let connection;
  connection = await sql.connect(dbConfig);
  console.log(enable);
  if (enable=="true"){
    en=1
  } else {
    en=0
  }

  await sql.query`
    UPDATE custom_notifications SET
      title = ${title},
      enableNotification = ${en},
      imageLink = ${imageLink}
    WHERE userId = ${userId}
  `;
}

async function deleteNotification(userId) {
    let connection;
  connection = await sql.connect(dbConfig);
  await sql.query`
    DELETE FROM custom_notifications WHERE userId = ${userId}
  `;
}



// find the all elderly's med supply where notification is enabled for today,
// find all the med logs for today

async function getMedSupplyAndEnabledAndLog(){
  let connection;
  connection = await sql.connect(dbConfig);

//calculate day of week
const today = "%"+ new Date().getDay() + "%";
console.log(today);
result = await sql.query`
    SELECT JT.userId, JT.notificationToken, JT.title,JT.medName,JT.imageLink, mTime FROM (
    SELECT m.supplyId, m.userId, n.notificationToken, n.title, med.medName, n.imageLink, s.value as mTime  
	FROM user_medication_supply m
	CROSS APPLY string_split( m.medTime, ',') s
    INNER JOIN custom_notifications n
	ON m.userId=n.userId
  INNER JOIN medications med 
  on med.medId=m.medId
    WHERE n.enableNotification = 1 and m.medDayOfWeek like ${today} ) as JT
	LEFT JOIN medication_logs l
	ON JT.supplyId = l.supplyId
	where l.logId is null
  `;
  return result.recordset;
}


async function getTitleByUserId(userId){
  let connection;
  connection = await sql.connect(dbConfig);
  const result = await sql.query`
  SELECT title FROM custom_notifications
  WHERE userId = ${userId}
  `;
  console.log(result.recordset[0].title);
  return result.recordset.length > 0 ? result.recordset[0].title : null;
}





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
  getMedSupplyAndEnabledAndLog,
  updateNotificationTokenByUserid,
  getTitleByUserId
};
