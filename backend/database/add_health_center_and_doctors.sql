-- Table pour les informations du centre de santé
CREATE TABLE IF NOT EXISTS health_center (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer une ligne par défaut
INSERT INTO health_center (name, contact, address, city)
VALUES ('Master Clinique', '', '', '')
ON DUPLICATE KEY UPDATE id=id;

-- Table pour les médecins et praticiens
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  specialization VARCHAR(150),
  license_number VARCHAR(100),
  qualification VARCHAR(255),
  experience_years INT,
  consultation_fee DECIMAL(10, 2),
  phone VARCHAR(50),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
