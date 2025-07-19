const NotificationModel = require("../models/NotificationModel");
const PushNotifications = require("node-pushnotifications");

async function getNotification(req, res) {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: "Missing or invalid userId" });

  try {
    const notification = await NotificationModel.getNotificationByUserId(userId);
    console.log(notification)
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    console.error("Get Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function createNotification(req, res) {
  const { userId, title, enable ,imageLink } = req.body;
  if (!userId || !title  == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await NotificationModel.getNotificationByUserId(userId);
    if (existing) {
      // User already has a notification, do not allow duplicate creation
      return res.status(409).json({ error: "Notification already exists. Use update instead." });
    }
    await NotificationModel.insertNotification({ userId, title, enable, imageLink });
    res.status(201).json({ message: "Notification created successfully" });
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

async function editNotification(req, res) {
  const userId = parseInt(req.params.userId);
 
  const {  title, enable, imageLink } = req.body;
   console.log("1 " + enable)
  if (!userId || !title   == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {

    const existing = await NotificationModel.getNotificationByUserId(userId);
    if (!existing) {
      return res.status(404).json({ error: "Notification not found. Create it first." });
    }
    await NotificationModel.updateNotification({ userId, title, enable, imageLink });
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


async function updateNotificationTokenByUserid(req, res)  {
  // Get pushSubscription object
  const {userId, notificationToken} = req.body;
  
  
  console.log(userId);
 // get the userid, save subscription with userid
NotificationModel.updateNotificationTokenByUserid(userId, notificationToken);

  //testing
  const settings = {
    web: {
      vapidDetails: {
        subject: "mailto: <ashtonleu@gmail.com>", 
        publicKey: process.env.publicKey,
        privateKey: process.env.privateKey,
      },
      gcmAPIKey: "gcmkey",
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
  };
  const push = new PushNotifications(settings);
  const payload = NotificationModel.getTitleByUserId;
    
    push.send(notificationToken, payload, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    }) ;

};

async function sendNotifications(req,res){
  
  notifs = await NotificationModel.getMedSupplyAndEnabledAndLog();
  console.log(notifs);
  notifs.forEach( function(element){

    const settings = {
    web: {
      vapidDetails: {
        subject: "mailto: <ashtonleu@gmail.com>", 
        publicKey: process.env.publicKey,
        privateKey: process.env.privateKey,
      },
      gcmAPIKey: "gcmkey",
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
    };
    const push = new PushNotifications(settings);
    console.log(element.imageLink)
    const payload = { title: element.title,
                      body: element.medName,
                      icon: element.imageLink==null? '/images/favicon.png' : element.imageLink
                    }
    
    push.send(JSON.parse(element.notificationToken), payload, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    }) ;
  });
  res.json({status:'sucess'});
}




module.exports = {
  getNotification,
  createNotification,
  editNotification,
  deleteNotification,
  updateNotificationTokenByUserid,
  sendNotifications
};
