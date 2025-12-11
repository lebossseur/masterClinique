-- Script pour corriger la table medical_consultations
USE master_clinique;

-- Ajouter la colonne status si elle n'existe pas
SET @query = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'master_clinique'
     AND table_name = 'medical_consultations'
     AND column_name = 'status') = 0,
    'ALTER TABLE medical_consultations ADD COLUMN status ENUM(''EN_ATTENTE'', ''EN_COURS'', ''TERMINEE'') DEFAULT ''EN_ATTENTE'' AFTER consultation_date',
    'SELECT ''La colonne status existe déjà'' as message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mettre à jour les consultations existantes sans statut (si elles existent)
UPDATE medical_consultations
SET status = 'EN_ATTENTE'
WHERE status IS NULL;

-- Afficher le résultat
SELECT 'Migration terminée' as resultat;

-- Afficher les consultations en attente
SELECT
    mc.id,
    CONCAT(p.first_name, ' ', p.last_name) as patient,
    p.patient_number,
    mc.consultation_date,
    mc.status,
    mc.chief_complaint as motif
FROM medical_consultations mc
JOIN patients p ON mc.patient_id = p.id
WHERE mc.status = 'EN_ATTENTE'
ORDER BY mc.consultation_date ASC;
