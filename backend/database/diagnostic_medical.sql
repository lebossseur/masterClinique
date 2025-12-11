-- Script de diagnostic pour vérifier l'état des tables médicales
USE master_clinique;

-- Vérifier si la table medical_consultations existe
SELECT
    'Table medical_consultations' as verification,
    CASE
        WHEN COUNT(*) > 0 THEN 'EXISTE'
        ELSE 'N''EXISTE PAS'
    END as statut
FROM information_schema.tables
WHERE table_schema = 'master_clinique'
AND table_name = 'medical_consultations';

-- Afficher la structure de la table medical_consultations si elle existe
DESCRIBE medical_consultations;

-- Compter les consultations par statut
SELECT
    COALESCE(status, 'NULL') as statut,
    COUNT(*) as nombre
FROM medical_consultations
GROUP BY status;

-- Afficher toutes les consultations
SELECT
    mc.id,
    mc.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) as patient,
    mc.consultation_date,
    COALESCE(mc.status, 'NULL') as statut,
    mc.chief_complaint as motif,
    mc.created_at
FROM medical_consultations mc
JOIN patients p ON mc.patient_id = p.id
ORDER BY mc.created_at DESC;
