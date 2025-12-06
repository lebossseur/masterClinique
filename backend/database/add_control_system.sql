-- Ajouter les colonnes pour le système de contrôle
ALTER TABLE admissions
ADD COLUMN is_control BOOLEAN DEFAULT FALSE AFTER consultation_type,
ADD COLUMN original_admission_id INT AFTER is_control,
ADD COLUMN control_valid_until DATE AFTER original_admission_id,
ADD INDEX idx_original_admission (original_admission_id),
ADD FOREIGN KEY (original_admission_id) REFERENCES admissions(id) ON DELETE SET NULL;

-- Ajouter une colonne pour indiquer si un service est gratuit (contrôle)
ALTER TABLE admission_services
ADD COLUMN is_free_control BOOLEAN DEFAULT FALSE AFTER patient_pays;
