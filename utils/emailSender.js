// utils/emailSender.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // false for port 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // allow self-signed certs / local dev
    }
});

const sendRefillNotification = async ({ elderlyEmail, caregiverEmails, elderlyName, medications }) => {
    const medicationList = medications.map(
        (med) => `- ${med.medName}: ${med.pillsLeft} pills left (Threshold: ${med.refillThreshold})`
    ).join("\n");

    const mailOptions = {
        from: `"Medication Reminder" <${process.env.SMTP_USER}>`,
        to: [elderlyEmail, ...caregiverEmails],
        subject: "Medication Refill Reminder",
        text: `
Hello ${elderlyName},

The following medications are below your refill threshold:

${medicationList}

Please ensure these medications are refilled soon.

Stay healthy!
– DailyDose
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(" Refill email sent:", info.response);
    } catch (err) {
        console.error(" Failed to send email:", err);
    }
};

module.exports = { sendRefillNotification };
