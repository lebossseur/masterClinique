-- Ajouter la colonne doctor_id à la table appointments
ALTER TABLE appointments
ADD COLUMN doctor_id INT AFTER patient_id,
ADD FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;
