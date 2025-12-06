-- Script de diagnostic de la base de données
-- Exécutez ce script pour voir l'état actuel de vos tables

USE master_clinique;

-- Diagnostic table insurance_companies
SELECT 'insurance_companies' as table_name;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'master_clinique'
AND TABLE_NAME = 'insurance_companies'
AND (COLUMN_NAME LIKE '%coverage%' OR COLUMN_NAME = 'code');

-- Diagnostic table insurance_coverage_rates
SELECT 'insurance_coverage_rates' as table_name;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'master_clinique'
AND TABLE_NAME = 'insurance_coverage_rates'
AND COLUMN_NAME LIKE '%coverage%';

-- Diagnostic table patient_insurance
SELECT 'patient_insurance' as table_name;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'master_clinique'
AND TABLE_NAME = 'patient_insurance'
AND COLUMN_NAME LIKE '%coverage%';

-- Diagnostic table admissions
SELECT 'admissions' as table_name;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'master_clinique'
AND TABLE_NAME = 'admissions'
AND COLUMN_NAME LIKE '%coverage%';
