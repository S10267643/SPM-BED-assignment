const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

const verifyJWT = require("./middlewares/verifyJWT");

const webpush = require("web-push");
const bodyParser = require("body-parser");
const PushNotifications = require("node-pushnotifications");
const publicVapidKey = "BA4Q6sKGB47yv8RbAPA4IcpElBk-HmxZo-PyNrUHzZWAhsyRkAf-LUeVgJGdBGs6K_7NQUswdlnQE2hzc-IxSjs"; // REPLACE_WITH_YOUR_KEY
const privateVapidKey = "YrffohJ_uHeaMuSDW4P7EvDlf_x03oxPH1htUl2EL3g"; //REPLACE_WITH_YOUR_KEY



// Load environment variables
dotenv.config();

//user Controllers
const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation"); // import User Validation Middleware


const notificationController = require("./controllers/NotificationController");




//translation controllers
const translationController = require("./controllers/translationController");

//medicationHistory controller
const medicationHistoryController = require("./controllers/medicationHistoryController")
//medicationSchedule controllers
const medicationValidation = require("./middlewares/medicationValidation");
const medicationController = require("./controllers/medicationController");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// User routes
app.get("/users/:id", validateUserId, userController.getUserById); //for future use when view/edit profile
app.post("/users", validateUser, userController.createUser);
app.post("/users/login", userController.loginUser);



// Custom notifications routes 

app.post("/api/notifications", notificationController.createNotification);
app.put("/api/notifications/:userId", notificationController.editNotification);
app.delete("/api/notifications/:userId", notificationController.deleteNotification);
app.get("/api/notifications/:userId", notificationController.getNotification);



//medicationSchedule routes
app.post('/api/medications', verifyJWT, medicationValidation.validateMedication, medicationController.addMedicine);
app.get('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.getMedicationById);
app.get('/api/medications/user/:userId',medicationController.getAllMedicationsByUserId);
app.put('/api/medications/:id', medicationValidation.validateMedicationId, medicationValidation.validateUpdateMedication, medicationController.updateMedicine);
app.delete('/api/medications/:id', medicationValidation.validateMedicationId, medicationController.deleteMedicine);



//Medication History routes
app.get('/api/medicationHistory/:id', medicationHistoryController.getMedicalHistoryById); // More specific route first
app.get('/api/medicationHistory/user/:userId', medicationHistoryController.getMedicalHistoryByUserId); // Changed path to avoid conflict




// Translation routes
app.get("/api/translations", translationController.getTranslations);
app.post("/api/update-language", translationController.updateLanguagePreference);


//send push notification 


app.use(bodyParser.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.post("/subscribe", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;
  const settings = {
    web: {
      vapidDetails: {
        subject: "mailto: <jeffeverhart383@gmail.com>", // REPLACE_WITH_YOUR_EMAIL
        publicKey: publicVapidKey,
        privateKey: privateVapidKey,
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
  console.log(subscription)
  

  // Create payload
  const payload = { title: "Notification from Knock" };
  push.send(subscription, payload, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
});



// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
