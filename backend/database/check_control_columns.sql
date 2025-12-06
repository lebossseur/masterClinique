-- Vérifier les colonnes de contrôle dans la table admissions
SHOW COLUMNS FROM admissions LIKE 'is_control';
SHOW COLUMNS FROM admissions LIKE 'original_admission_id';
SHOW COLUMNS FROM admissions LIKE 'control_valid_until';

-- Vérifier les colonnes de contrôle dans la table admission_services
SHOW COLUMNS FROM admission_services LIKE 'is_free_control';
