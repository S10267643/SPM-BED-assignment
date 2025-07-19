CREATE TABLE users (  

userId INT IDENTITY(1,1) PRIMARY KEY,  

name VARCHAR(100) UNIQUE NOT NULL,  

email VARCHAR(100) UNIQUE NOT NULL,  

phone VARCHAR(15), password VARCHAR(255) NOT NULL,  

preferredLanguage VARCHAR(20) DEFAULT 'English', 

 role VARCHAR(20) 

);  

CREATE TABLE medication_logs ( 

logId INT PRIMARY KEY IDENTITY(1,1), 

 userId INT,  

medId INT,  

logDate DATE,  

FOREIGN KEY (userId) REFERENCES users(userId) 

 );  

CREATE TABLE custom_notifications ( 

notificationId INT IDENTITY(1,1) PRIMARY KEY, 

userId INT , 

ringtoneName NVARCHAR(255) NOT NULL, 

youtubeLink NVARCHAR(255) NULL, notificationToken VARCHAR(1024), enableNotification BINARY, FOREIGN KEY (userId) REFERENCES users(userId) 

 );  

CREATE TABLE medications (  

medId INT IDENTITY(1,1) PRIMARY KEY,  

medName VARCHAR(100) NOT NULL UNIQUE  

);  

CREATE TABLE medication_history ( 

historyId INT IDENTITY(1,1) PRIMARY KEY, 

userId INT, 

medId INT, 

dosage VARCHAR(50), refillThreshold INT, supplyQuantity INT, 

pillsLeft INT NOT NULL, 

 medTime VarChar(50),  

medDayOfWeek VarChar(200),  

notes TEXT,  

createDate Date, 

FOREIGN KEY (userId) REFERENCES users(userId), 

FOREIGN KEY (medId) REFERENCES medications(medId) 

 );  

 

CREATE TABLE user_medication_supply ( 

 supplyId INT IDENTITY(1,1) PRIMARY KEY, 

userId INT , 

medId INT, 

pillsLeft INT NOT NULL, 

dosage VARCHAR(50),  

refillThreshold INT,  

supplyQuantity INT, 

medTime VarChar(50), 

 medDayOfWeek VarChar(200),  

createDate Date 

 );  

Create Table Emergency_Contacts( 

contactsId INT PRIMARY KEY IDENTITY(1,1), 

contactName VARCHAR(100) NOT NULL, 

phoneNumber VARCHAR(15), 

); 

CREATE TABLE password_reset_otps (
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
