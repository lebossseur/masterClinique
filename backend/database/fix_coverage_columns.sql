-- Script de correction intelligent pour les colonnes de couverture
-- Ce script gère tous les cas possibles et ne génère pas d'erreurs

USE master_clinique;

-- ======================================
-- FIX 1: Table insurance_companies
-- ======================================

-- Cas 1: Si on a les deux colonnes (default_coverage_rate ET coverage_percentage), supprimer l'ancienne
SET @both_exist = (
  SELECT COUNT(*) = 2
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'insurance_companies'
  AND COLUMN_NAME IN ('default_coverage_rate', 'coverage_percentage')
);

SET @sql = IF(@both_exist = 1,
  'ALTER TABLE insurance_companies DROP COLUMN default_coverage_rate',
  'SELECT "Pas besoin de supprimer default_coverage_rate" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cas 2: Si on a seulement default_coverage_rate, la renommer
SET @has_old_only = (
  SELECT COUNT(*) = 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'insurance_companies'
  AND COLUMN_NAME = 'default_coverage_rate'
);

SET @sql = IF(@has_old_only = 1,
  'ALTER TABLE insurance_companies CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00',
  'SELECT "coverage_percentage existe déjà ou pas de colonne à renommer" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- S'assurer que le champ code est nullable
ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- ======================================
-- FIX 2: Table insurance_coverage_rates
-- ======================================

-- Vérifier si la table existe d'abord
SET @table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'insurance_coverage_rates'
);

-- Si la table existe, corriger les colonnes
SET @both_exist = IF(@table_exists = 1,
  (SELECT COUNT(*) = 2
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'master_clinique'
   AND TABLE_NAME = 'insurance_coverage_rates'
   AND COLUMN_NAME IN ('coverage_rate', 'coverage_percentage')),
  0
);

-- Supprimer l'ancienne si les deux existent
SET @sql = IF(@both_exist = 1,
  'ALTER TABLE insurance_coverage_rates DROP COLUMN coverage_rate',
  'SELECT "Pas besoin de supprimer coverage_rate dans insurance_coverage_rates" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer si seulement l'ancienne existe
SET @has_old_only = IF(@table_exists = 1,
  (SELECT COUNT(*) = 1
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'master_clinique'
   AND TABLE_NAME = 'insurance_coverage_rates'
   AND COLUMN_NAME = 'coverage_rate'),
  0
);

SET @sql = IF(@has_old_only = 1,
  'ALTER TABLE insurance_coverage_rates CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) NOT NULL',
  'SELECT "coverage_percentage existe déjà dans insurance_coverage_rates" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- FIX 3: Table patient_insurance
-- ======================================

SET @both_exist = (
  SELECT COUNT(*) = 2
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'patient_insurance'
  AND COLUMN_NAME IN ('coverage_rate', 'coverage_percentage')
);

-- Supprimer l'ancienne si les deux existent
SET @sql = IF(@both_exist = 1,
  'ALTER TABLE patient_insurance DROP COLUMN coverage_rate',
  'SELECT "Pas besoin de supprimer coverage_rate dans patient_insurance" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer si seulement l'ancienne existe
SET @has_old_only = (
  SELECT COUNT(*) = 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'patient_insurance'
  AND COLUMN_NAME = 'coverage_rate'
);

SET @sql = IF(@has_old_only = 1,
  'ALTER TABLE patient_insurance CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0',
  'SELECT "coverage_percentage existe déjà dans patient_insurance" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- FIX 4: Table admissions
-- ======================================

SET @both_exist = (
  SELECT COUNT(*) = 2
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'admissions'
  AND COLUMN_NAME IN ('coverage_rate', 'coverage_percentage')
);

-- Supprimer l'ancienne si les deux existent
SET @sql = IF(@both_exist = 1,
  'ALTER TABLE admissions DROP COLUMN coverage_rate',
  'SELECT "Pas besoin de supprimer coverage_rate dans admissions" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer si seulement l'ancienne existe
SET @has_old_only = (
  SELECT COUNT(*) = 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'master_clinique'
  AND TABLE_NAME = 'admissions'
  AND COLUMN_NAME = 'coverage_rate'
);

SET @sql = IF(@has_old_only = 1,
  'ALTER TABLE admissions CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00',
  'SELECT "coverage_percentage existe déjà dans admissions" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================
-- Vérification finale
-- ======================================
SELECT '✓ Migration terminée avec succès!' AS status;

-- Afficher l'état final
SELECT 'État final - insurance_companies:' AS info;
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'master_clinique'
AND TABLE_NAME = 'insurance_companies'
AND (COLUMN_NAME LIKE '%coverage%' OR COLUMN_NAME = 'code');
