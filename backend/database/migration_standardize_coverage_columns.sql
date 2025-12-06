-- Migration script to standardize coverage column names
-- This script updates all tables to use 'coverage_percentage' instead of 'coverage_rate' or 'default_coverage_rate'
-- Safe to run multiple times

USE master_clinique;

-- ======================================
-- 1. Update insurance_companies table
-- ======================================

-- Check if old column exists and rename it
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'insurance_companies'
  AND COLUMN_NAME = 'default_coverage_rate'
);

-- Rename default_coverage_rate to coverage_percentage if it exists
SET @sql = IF(@col_exists > 0,
  'ALTER TABLE insurance_companies CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00',
  'SELECT "Column default_coverage_rate does not exist, skipping rename" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make sure the 'code' column is nullable (not required)
ALTER TABLE insurance_companies
MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- ======================================
-- 2. Update insurance_coverage_rates table
-- ======================================

-- Check if table exists
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'insurance_coverage_rates'
);

-- Only proceed if table exists
SET @col_exists = IF(@table_exists > 0,
  (SELECT COUNT(*)
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'master_clinique'
   AND TABLE_NAME = 'insurance_coverage_rates'
   AND COLUMN_NAME = 'coverage_rate'),
  0
);

-- Rename coverage_rate to coverage_percentage in insurance_coverage_rates if it exists
SET @sql = IF(@col_exists > 0,
  'ALTER TABLE insurance_coverage_rates CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) NOT NULL COMMENT "Taux de couverture en pourcentage (0-100)"',
  'SELECT "Column coverage_rate does not exist in insurance_coverage_rates, skipping rename" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- 3. Update patient_insurance table
-- ======================================

-- Check if old column exists in patient_insurance
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'patient_insurance'
  AND COLUMN_NAME = 'coverage_rate'
);

-- Rename coverage_rate to coverage_percentage in patient_insurance if it exists
SET @sql = IF(@col_exists > 0,
  'ALTER TABLE patient_insurance CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0',
  'SELECT "Column coverage_rate does not exist in patient_insurance, skipping rename" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- 4. Update admissions table
-- ======================================

-- Check if old column exists in admissions
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'admissions'
  AND COLUMN_NAME = 'coverage_rate'
);

-- Rename coverage_rate to coverage_percentage in admissions if it exists
SET @sql = IF(@col_exists > 0,
  'ALTER TABLE admissions CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT "Taux de couverture appliqué (%)"',
  'SELECT "Column coverage_rate does not exist in admissions, skipping rename" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- Summary
-- ======================================
SELECT 'Migration complete! All coverage columns have been standardized to use coverage_percentage naming.' AS message;
