-- ========================================
-- VÉRIFICATION EXACTE DES COLONNES
-- Copiez-collez dans phpMyAdmin → SQL
-- ========================================

USE master_clinique;

-- 1. Vérifier patient_insurance
SELECT 'VÉRIFICATION: patient_insurance' AS verification;
SHOW COLUMNS FROM patient_insurance;

-- 2. Chercher spécifiquement 'notes'
SELECT 'Est-ce que notes existe ?' AS question;
SHOW COLUMNS FROM patient_insurance WHERE Field = 'notes';

-- 3. Vérifier admissions
SELECT 'VÉRIFICATION: admissions' AS verification;
SHOW COLUMNS FROM admissions WHERE Field LIKE '%coverage%';

-- 4. Afficher la base utilisée
SELECT DATABASE() as base_de_donnees_actuelle;
