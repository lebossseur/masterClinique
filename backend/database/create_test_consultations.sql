-- Script pour créer des consultations de test
USE master_clinique;

-- Créer des dossiers médicaux pour les patients s'ils n'existent pas
INSERT IGNORE INTO medical_records (patient_id, created_by, created_at)
SELECT id, 1, NOW() FROM patients WHERE id IN (1, 2, 3);

-- Créer des consultations en attente
INSERT INTO medical_consultations
  (medical_record_id, patient_id, consultation_date, status, doctor_id, chief_complaint, symptoms, notes)
VALUES
  -- Consultation pour joseph kouakou
  (
    (SELECT id FROM medical_records WHERE patient_id = 1),
    1,
    NOW(),
    'EN_ATTENTE',
    NULL,
    'Fièvre et maux de tête',
    'Patient se plaint de fièvre depuis 3 jours, accompagnée de maux de tête intenses',
    'Constantes: T=38.5°C, TA=120/80, FC=85'
  ),
  -- Consultation pour NADEGE KOUMAN
  (
    (SELECT id FROM medical_records WHERE patient_id = 2),
    2,
    NOW(),
    'EN_ATTENTE',
    NULL,
    'Douleurs abdominales',
    'Douleurs abdominales depuis hier soir, nausées',
    'Constantes: T=37.2°C, TA=115/75, FC=78, Poids=65kg'
  ),
  -- Consultation pour JULES BEUCLER
  (
    (SELECT id FROM medical_records WHERE patient_id = 3),
    3,
    NOW(),
    'EN_ATTENTE',
    NULL,
    'Contrôle de routine',
    'Patient vient pour un contrôle de routine annuel',
    'Constantes: T=37.0°C, TA=125/82, FC=72, Poids=78kg, Glycémie=1.05'
  );

-- Vérifier les consultations créées
SELECT
  mc.id,
  mc.consultation_date,
  mc.status,
  p.first_name,
  p.last_name,
  mc.chief_complaint
FROM medical_consultations mc
JOIN patients p ON mc.patient_id = p.id
WHERE mc.status = 'EN_ATTENTE';
