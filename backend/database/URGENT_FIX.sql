-- ========================================
-- CORRECTION URGENTE - À EXÉCUTER DANS PHPMYADMIN
-- ========================================

USE master_clinique;

-- ========================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
-- ========================================
-- Exécutez d'abord ces commandes pour voir ce que vous avez :

SELECT 'Structure de patient_insurance:' AS info;
SHOW COLUMNS FROM patient_insurance;

SELECT 'Structure de admissions:' AS info;
SHOW COLUMNS FROM admissions;

SELECT 'Structure de insurance_companies:' AS info;
SHOW COLUMNS FROM insurance_companies;

-- ========================================
-- 2. CORRIGER LA TABLE patient_insurance
-- ========================================

-- Ajouter la colonne 'notes' si elle n'existe pas
ALTER TABLE patient_insurance
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Renommer coverage_rate en coverage_percentage (si coverage_rate existe)
-- Si erreur "column doesn't exist", ignorez
ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

-- ========================================
-- 3. CORRIGER LA TABLE admissions
-- ========================================

-- Renommer coverage_rate en coverage_percentage (si coverage_rate existe)
-- Si erreur "column doesn't exist", ignorez
ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Si admissions n'a pas les colonnes de pricing, les ajouter
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS insurance_company_id INT NULL,
ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS coverage_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS insurance_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS patient_amount DECIMAL(10,2) DEFAULT 0.00;

-- ========================================
-- 4. CORRIGER LA TABLE insurance_companies
-- ========================================

-- Rendre le champ code nullable
ALTER TABLE insurance_companies
MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- Renommer default_coverage_rate en coverage_percentage (si existe)
-- Si erreur "column doesn't exist", ignorez
ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- ========================================
-- 5. VÉRIFICATION FINALE
-- ========================================

SELECT '✅ VÉRIFICATION FINALE:' AS status;

SELECT 'patient_insurance doit avoir: coverage_percentage, notes' AS verification;
SHOW COLUMNS FROM patient_insurance WHERE Field IN ('coverage_percentage', 'notes');

SELECT 'admissions doit avoir: coverage_percentage' AS verification;
SHOW COLUMNS FROM admissions WHERE Field = 'coverage_percentage';

SELECT 'insurance_companies doit avoir: coverage_percentage, code (nullable)' AS verification;
SHOW COLUMNS FROM insurance_companies WHERE Field IN ('coverage_percentage', 'code');

SELECT '✅ Migration terminée!' AS status;
