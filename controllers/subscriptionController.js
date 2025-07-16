const subscriptionModel = require("../models/subscriptionModel");


const PushNotifications = require("node-pushnotifications");
async function updateSubscriptionByUserid(req, res)  {
  // Get pushSubscription object
  const {userId, notificationToken} = req.body;
  const settings = {
    web: {
      vapidDetails: {
        subject: "mailto: <ashtonleu@gmail.com>", 
        publicKey: process.env.publicVapidKey,
        privateKey: process.env.privateVapidKey,
      },
      gcmAPIKey: "gcmkey",
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
  };

  // Send 201 - resource created
  const push = new PushNotifications(settings);
  
  console.log(userId);
 // get the userid, save subscription with userid
  subscriptionModel.updateSubscriptionByUserid(userId, notificationToken);  

 // Create payload

 const payload = { title: "Notification from Knock" };
 
  push.send(notificationToken, payload, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};
module.exports = {
  updateSubscriptionByUserid
};