CREATE TABLE users (  

user_id INT IDENTITY(1,1) PRIMARY KEY, 

name VARCHAR(100) UNIQUE NOT NULL, 

email VARCHAR(100) UNIQUE NOT NULL, 

phone VARCHAR(15), 

password VARCHAR(255) NOT NULL, 

preferred_language VARCHAR(20) DEFAULT 'English', 

role VARCHAR(20) 

);  

 

CREATE TABLE medication_schedule (  

id INT PRIMARY KEY IDENTITY(1,1), 

user_id INT, 

medication_name VarChar(50), 

day_of_week TINYINT CHECK (day_of_week BETWEEN 1 AND 7), 

time TIME, 

dosage VARCHAR(50), 

FOREIGN KEY (user_id) REFERENCES users(user_id),  

); 

 

CREATE TABLE medication_logs (  

id INT PRIMARY KEY IDENTITY(1,1), 

user_id INT, 

medication_name VarChar(50), 

log_date DATE, 

taken BIT, 

FOREIGN KEY (user_id) REFERENCES users(user_id),  

);  

 

Create Table Emergency_Contacts(  

id INT PRIMARY KEY IDENTITY(1,1),  

contact_name VARCHAR(100) NOT NULL,  

phone_number INT,  

user_id INT NOT NULL,  

FOREIGN KEY (user_id) REFERENCES users(user_id),  

);  

 

CREATE TABLE custom_notifications (  

id INT IDENTITY(1,1) PRIMARY KEY,  
user_id INT NOT NULL UNIQUE,  -- one notification per user  
ringtone_name NVARCHAR(255) NOT NULL,  
vibration_type NVARCHAR(10) NOT NULL,  -- 'On' or 'Off'  
repeat_count INT NOT NULL,  
youtube_link NVARCHAR(255) NULL 

); 

 

 

CREATE TABLE medications ( 

    id INT IDENTITY(1,1) PRIMARY KEY, 

    name VARCHAR(100) NOT NULL UNIQUE); 

 
CREATE TABLE medication_history ( id INT IDENTITY(1,1) PRIMARY KEY, user_id INT NOT NULL, medication_id INT NOT NULL, prescribed_by VARCHAR(100), prescribed_date DATE, dosage VARCHAR(50), duration_days INT, status VARCHAR(50), notes TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id), FOREIGN KEY (medication_id) REFERENCES medications(id) ); 

CREATE TABLE user_medication_supply ( id INT IDENTITY(1,1) PRIMARY KEY, user_id INT FOREIGN KEY REFERENCES users(user_id), medication_id INT FOREIGN KEY REFERENCES medications(id), pills_left INT NOT NULL, dosage_per_day INT NOT NULL,  refill_threshold INT DEFAULT 3); 

 

 

 

--Sample data: 

 

SET IDENTITY_INSERT users ON; 

INSERT INTO users (user_id, name, email, phone, password, preferred_language, role) VALUES (1, 'Alice Tan', 'alice.tan@example.com', '81234567', 'hashedpassword1', 'English', Elderly), (2, 'Ben Lee', 'ben.lee@example.com', '91234567', 'hashedpassword2', 'English', Caregiver), (3, 'Charlie Ong', 'charlie.ong@example.com', '92223333', 'hashedpassword3', 'Chinese', Elderly); 

SET IDENTITY_INSERT users OFF; 

 

 

SET IDENTITY_INSERT medications ON; 

  

INSERT INTO medications (id, name) 

VALUES  

(4, 'Amlodipine'), 

(72, 'Metformin'), 

(2, 'Paracetamol'); 

  

SET IDENTITY_INSERT medications OFF; 

 

SET IDENTITY_INSERT user_medication_supply ON; 

INSERT INTO user_medication_supply (id, user_id, medication_id, pills_left, dosage_per_day, refill_threshold) VALUES (1, 1, 4, 5, 2, 3), (2, 2, 72, 14, 1, 3), (3, 1, 2, 6, 3, 3), (4, 2, 72, 10, 2, 3), (5, 3, 2, 2, 1, 3); 

SET IDENTITY_INSERT user_medication_supply OFF; 

 

SET IDENTITY_INSERT medication_logs ON; 

INSERT INTO medication_logs (id, user_id, medication_name, log_date, taken) VALUES (1, 1, 'Paracetamol', '2025-07-10', 1), (2, 1, 'Paracetamol', '2025-07-11', 1), (3, 1, 'Paracetamol', '2025-07-12', 1), (4, 1, 'Paracetamol', '2025-07-13', 1), (5, 1, 'Paracetamol', '2025-07-14', 1), (6, 1, 'Paracetamol', '2025-07-15', 1), (7, 1, 'Paracetamol', '2025-07-16', 1), (8, 1, 'Amoxicillin', '2025-07-10', 1), (9, 1, 'Amoxicillin', '2025-07-11', 1), (10, 1, 'Amoxicillin', '2025-07-12', 0), (11, 1, 'Amoxicillin', '2025-07-13', 1), (12, 1, 'Amoxicillin', '2025-07-14', 1), (13, 3, 'Metformin', '2025-07-10', 1), (14, 3, 'Metformin', '2025-07-12', 1), (15, 3, 'Metformin', '2025-07-14', 1), (16, 3, 'Metformin', '2025-07-16', 1); 

SET IDENTITY_INSERT medication_logs OFF; 

 

 