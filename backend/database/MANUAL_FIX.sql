-- ========================================
-- CORRECTION MANUELLE ÉTAPE PAR ÉTAPE
-- Exécutez chaque commande UNE PAR UNE dans phpMyAdmin
-- ========================================

-- D'abord, sélectionnez la base de données
USE master_clinique;

-- ========================================
-- ÉTAPE 1: Voir l'état actuel
-- Exécutez cette commande pour voir ce que vous avez:
-- ========================================

SHOW COLUMNS FROM insurance_companies;

-- Regardez le résultat. Vous devriez voir soit:
-- - coverage_percentage (BIEN - passez à ÉTAPE 3)
-- - default_coverage_rate (continuez à ÉTAPE 2)
-- - LES DEUX (continuez à ÉTAPE 2 variante B)

-- ========================================
-- ÉTAPE 2A: Si vous avez SEULEMENT default_coverage_rate
-- Exécutez cette commande:
-- ========================================

ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- ========================================
-- ÉTAPE 2B: Si vous avez LES DEUX colonnes
-- Exécutez d'abord celle-ci pour supprimer l'ancienne:
-- ========================================

ALTER TABLE insurance_companies DROP COLUMN default_coverage_rate;

-- ========================================
-- ÉTAPE 3: Rendre le code optionnel
-- Exécutez cette commande:
-- ========================================

ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- ========================================
-- ÉTAPE 4: Vérifier la table patient_insurance
-- Exécutez cette commande:
-- ========================================

SHOW COLUMNS FROM patient_insurance LIKE '%coverage%';

-- Si vous voyez coverage_rate, exécutez:
ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

-- Si vous voyez coverage_percentage, IGNOREZ la commande ci-dessus

-- ========================================
-- ÉTAPE 5: Vérifier la table admissions
-- Exécutez cette commande:
-- ========================================

SHOW COLUMNS FROM admissions LIKE '%coverage%';

-- Si vous voyez coverage_rate, exécutez:
ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Si vous voyez coverage_percentage, IGNOREZ la commande ci-dessus

-- ========================================
-- ÉTAPE 6: Vérifier insurance_coverage_rates (si table existe)
-- Exécutez cette commande:
-- ========================================

SHOW COLUMNS FROM insurance_coverage_rates LIKE '%coverage%';

-- Si vous voyez coverage_rate, exécutez:
ALTER TABLE insurance_coverage_rates
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) NOT NULL;

-- Si vous voyez coverage_percentage OU si la table n'existe pas, IGNOREZ

-- ========================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- Exécutez ces commandes pour confirmer:
-- ========================================

SELECT 'Vérification insurance_companies:' AS verification;
SHOW COLUMNS FROM insurance_companies WHERE Field IN ('code', 'coverage_percentage');

SELECT 'Vérification patient_insurance:' AS verification;
SHOW COLUMNS FROM patient_insurance WHERE Field = 'coverage_percentage';

SELECT 'Vérification admissions:' AS verification;
SHOW COLUMNS FROM admissions WHERE Field = 'coverage_percentage';

-- ========================================
-- ✓ C'EST TERMINÉ !
-- ========================================
