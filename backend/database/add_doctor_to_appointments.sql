-- Ajouter le champ doctor_id à la table appointments

ALTER TABLE appointments
ADD COLUMN doctor_id INT UNSIGNED AFTER patient_id,
ADD CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id);

-- Rendre le motif NOT NULL
ALTER TABLE appointments
MODIFY COLUMN reason VARCHAR(255) NOT NULL;
