-- Table pour stocker les actes médicaux par admission
CREATE TABLE IF NOT EXISTS admission_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admission_id INT NOT NULL,
  service_code VARCHAR(50) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  insurance_covered DECIMAL(10,2) DEFAULT 0,
  patient_pays DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
  INDEX idx_admission_id (admission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
