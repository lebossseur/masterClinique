-- Script de correction simple SANS INFORMATION_SCHEMA
-- Certaines commandes peuvent afficher des avertissements, c'est normal !

USE master_clinique;

-- ======================================
-- 1. Table insurance_companies
-- ======================================

-- Rendre le champ code nullable (optionnel)
ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- Si vous avez default_coverage_rate, essayez de le renommer
-- (Si erreur "n'existe pas", ignorez)
ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Si vous avez les deux colonnes, supprimez l'ancienne
-- (Si erreur "n'existe pas", ignorez)
-- ALTER TABLE insurance_companies DROP COLUMN default_coverage_rate;

-- ======================================
-- 2. Table patient_insurance
-- ======================================

-- Renommer coverage_rate en coverage_percentage
-- (Si erreur "n'existe pas", ignorez)
ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

-- ======================================
-- 3. Table admissions
-- ======================================

-- Renommer coverage_rate en coverage_percentage
-- (Si erreur "n'existe pas", ignorez)
ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- ======================================
-- 4. Table insurance_coverage_rates (si existe)
-- ======================================

-- Renommer coverage_rate en coverage_percentage
-- (Si erreur "table n'existe pas", ignorez)
ALTER TABLE insurance_coverage_rates
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) NOT NULL;

-- ======================================
-- Vérification
-- ======================================

SELECT '✓ Script exécuté ! Vérifiez les résultats ci-dessous.' AS status;

-- Voir les colonnes de insurance_companies
SHOW COLUMNS FROM insurance_companies LIKE '%coverage%';
SHOW COLUMNS FROM insurance_companies LIKE 'code';
