-- Table pour les admissions/consultations
CREATE TABLE IF NOT EXISTS admissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  consultation_type ENUM(
    'CONSULTATION_GENERALE',
    'CONSULTATION_PRENATALE',
    'CONSULTATION_GYNECOLOGIQUE',
    'RADIOGRAPHIE',
    'EXAMENS_MEDICAUX',
    'URGENCE',
    'CHIRURGIE',
    'AUTRE'
  ) NOT NULL,
  consultation_reason TEXT,
  has_insurance BOOLEAN DEFAULT FALSE,
  status ENUM('WAITING_BILLING', 'BILLED', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING_BILLING',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table pour les constantes vitales
CREATE TABLE IF NOT EXISTS patient_vitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admission_id INT,
  patient_id INT NOT NULL,
  temperature DECIMAL(4,1),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  blood_sugar DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_created_at ON admissions(created_at);
CREATE INDEX idx_vitals_admission ON patient_vitals(admission_id);
CREATE INDEX idx_vitals_patient ON patient_vitals(patient_id);
