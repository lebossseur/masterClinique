-- Script pour créer les tables de dossiers médicaux
USE master_clinique;

-- Table des dossiers médicaux (un par patient)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL UNIQUE,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') DEFAULT NULL,
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  family_history TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des consultations médicales
CREATE TABLE IF NOT EXISTS medical_consultations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medical_record_id INT NOT NULL,
  patient_id INT NOT NULL,
  consultation_date DATETIME NOT NULL,
  status ENUM('EN_ATTENTE', 'EN_COURS', 'TERMINEE') DEFAULT 'EN_ATTENTE',
  doctor_id INT,
  chief_complaint TEXT NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Table des examens médicaux
CREATE TABLE IF NOT EXISTS medical_examinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consultation_id INT NOT NULL,
  patient_id INT NOT NULL,
  examination_type ENUM('PHYSICAL', 'LABORATORY', 'IMAGING', 'OTHER') NOT NULL,
  examination_name VARCHAR(255) NOT NULL,
  examination_date DATE NOT NULL,
  results TEXT,
  findings TEXT,
  performed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consultation_id) REFERENCES medical_consultations(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Table des vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medical_record_id INT NOT NULL,
  patient_id INT NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  vaccination_date DATE NOT NULL,
  next_dose_date DATE,
  lot_number VARCHAR(100),
  administered_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (administered_by) REFERENCES users(id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_medical_consultations_patient ON medical_consultations(patient_id);
CREATE INDEX idx_medical_consultations_date ON medical_consultations(consultation_date);
CREATE INDEX idx_medical_examinations_patient ON medical_examinations(patient_id);
CREATE INDEX idx_vaccinations_patient ON vaccinations(patient_id);

-- Afficher la structure créée
SHOW TABLES LIKE 'medical_%';
SHOW TABLES LIKE 'vaccinations';
