-- Vérifier la structure de la table payments
DESCRIBE payments;

-- Vérifier les données existantes
SELECT * FROM payments LIMIT 5;

-- Vérifier si la colonne received_by existe
SHOW COLUMNS FROM payments LIKE 'received_by';
