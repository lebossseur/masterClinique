-- Table des tarifs des actes médicaux
CREATE TABLE IF NOT EXISTS medical_service_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_code VARCHAR(50) UNIQUE NOT NULL,
  service_name VARCHAR(200) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des compagnies d'assurance (mise à jour avec taux de couverture)
CREATE TABLE IF NOT EXISTS insurance_companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(200),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  coverage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Taux de couverture par défaut (0-100%)',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des taux de couverture par assurance et par type d'acte
CREATE TABLE IF NOT EXISTS insurance_coverage_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  insurance_company_id INT NOT NULL,
  service_code VARCHAR(50) NOT NULL,
  coverage_percentage DECIMAL(5,2) NOT NULL COMMENT 'Taux de couverture en pourcentage (0-100)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id) ON DELETE CASCADE,
  FOREIGN KEY (service_code) REFERENCES medical_service_prices(service_code) ON DELETE CASCADE,
  UNIQUE KEY unique_insurance_service (insurance_company_id, service_code)
);

-- Insertion des tarifs par défaut pour les actes médicaux
INSERT INTO medical_service_prices (service_code, service_name, base_price, description) VALUES
('CONSULTATION_GENERALE', 'Consultation Générale', 5000.00, 'Consultation médicale générale'),
('CONSULTATION_PRENATALE', 'Consultation Prénatale', 7000.00, 'Consultation de suivi de grossesse'),
('CONSULTATION_GYNECOLOGIQUE', 'Consultation Gynécologique', 8000.00, 'Consultation gynécologique'),
('RADIOGRAPHIE', 'Radiographie', 15000.00, 'Examen radiographique'),
('EXAMENS_MEDICAUX', 'Examens Médicaux', 10000.00, 'Examens médicaux et analyses'),
('URGENCE', 'Urgence', 12000.00, 'Prise en charge d\'urgence'),
('CHIRURGIE', 'Chirurgie', 50000.00, 'Intervention chirurgicale'),
('AUTRE', 'Autre Acte', 5000.00, 'Autre type de consultation ou acte')
ON DUPLICATE KEY UPDATE base_price = VALUES(base_price);

-- Insertion de compagnies d'assurance exemples
INSERT INTO insurance_companies (name, code, coverage_percentage) VALUES
('NSIA Assurance', 'NSIA', 70.00),
('SUNU Assurances', 'SUNU', 80.00),
('Allianz Côte d\'Ivoire', 'ALLIANZ', 75.00),
('SONAR', 'SONAR', 60.00)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insertion de taux de couverture spécifiques par assurance
-- NSIA
INSERT INTO insurance_coverage_rates (insurance_company_id, service_code, coverage_percentage)
SELECT id, 'CONSULTATION_GENERALE', 70.00 FROM insurance_companies WHERE code = 'NSIA'
ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage);

INSERT INTO insurance_coverage_rates (insurance_company_id, service_code, coverage_percentage)
SELECT id, 'CONSULTATION_PRENATALE', 90.00 FROM insurance_companies WHERE code = 'NSIA'
ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage);

INSERT INTO insurance_coverage_rates (insurance_company_id, service_code, coverage_percentage)
SELECT id, 'RADIOGRAPHIE', 60.00 FROM insurance_companies WHERE code = 'NSIA'
ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage);

-- SUNU
INSERT INTO insurance_coverage_rates (insurance_company_id, service_code, coverage_percentage)
SELECT id, 'CONSULTATION_GENERALE', 80.00 FROM insurance_companies WHERE code = 'SUNU'
ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage);

INSERT INTO insurance_coverage_rates (insurance_company_id, service_code, coverage_percentage)
SELECT id, 'URGENCE', 100.00 FROM insurance_companies WHERE code = 'SUNU'
ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage);

-- Ajout des colonnes de prix dans la table admissions
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Prix de base de l\'acte',
ADD COLUMN IF NOT EXISTS insurance_company_id INT NULL COMMENT 'Compagnie d\'assurance',
ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100) NULL COMMENT 'Numéro de police d\'assurance',
ADD COLUMN IF NOT EXISTS coverage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Taux de couverture appliqué (%)',
ADD COLUMN IF NOT EXISTS insurance_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant pris en charge par assurance',
ADD COLUMN IF NOT EXISTS patient_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant à payer par le patient';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_service_prices_active ON medical_service_prices(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_active ON insurance_companies(is_active);
CREATE INDEX IF NOT EXISTS idx_coverage_insurance ON insurance_coverage_rates(insurance_company_id);
CREATE INDEX IF NOT EXISTS idx_coverage_service ON insurance_coverage_rates(service_code);
