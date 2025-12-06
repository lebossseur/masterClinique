-- Mise à jour de la table patient_insurance pour gérer plusieurs assurances par patient
-- avec leurs taux de couverture spécifiques

-- Vérifier si la table existe et la créer/modifier si nécessaire
CREATE TABLE IF NOT EXISTS patient_insurance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  insurance_company_id INT NOT NULL,
  policy_number VARCHAR(100) NOT NULL COMMENT 'Numéro de police d\'assurance',
  coverage_rate DECIMAL(5,2) NOT NULL DEFAULT 70.00 COMMENT 'Taux de couverture spécifique pour ce patient (%)',
  start_date DATE NOT NULL COMMENT 'Date de début de couverture',
  end_date DATE NULL COMMENT 'Date de fin de couverture',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Assurance active ou non',
  notes TEXT COMMENT 'Notes ou remarques',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_patient_insurance (patient_id, insurance_company_id, policy_number)
);

-- Modification de la table admissions pour référencer l'assurance du patient
ALTER TABLE admissions
DROP FOREIGN KEY IF EXISTS fk_admissions_insurance,
ADD COLUMN IF NOT EXISTS patient_insurance_id INT NULL COMMENT 'Référence à l\'assurance du patient utilisée',
ADD CONSTRAINT fk_admissions_patient_insurance
  FOREIGN KEY (patient_insurance_id) REFERENCES patient_insurance(id) ON DELETE SET NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_company ON patient_insurance(insurance_company_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_active ON patient_insurance(is_active);
CREATE INDEX IF NOT EXISTS idx_admissions_patient_insurance ON admissions(patient_insurance_id);
