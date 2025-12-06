-- Vérifier la structure actuelle de la table invoices
SHOW COLUMNS FROM invoices LIKE 'status';

-- Modifier l'enum pour ajouter la valeur 'CONTROLE'
ALTER TABLE invoices
MODIFY COLUMN status ENUM('PENDING', 'PARTIAL', 'PAID', 'CONTROLE', 'CANCELLED') DEFAULT 'PENDING';

-- Mettre à jour TOUTES les factures de contrôle pour qu'elles aient le statut CONTROLE
-- Puis mettre à jour les autres factures selon leur état de paiement
UPDATE invoices i
LEFT JOIN admissions a ON i.admission_id = a.id
LEFT JOIN (
    SELECT invoice_id, COALESCE(SUM(amount), 0) as total_paid
    FROM payments
    GROUP BY invoice_id
) p ON i.id = p.invoice_id
SET i.status = CASE
    -- Les factures de contrôle ont toujours le statut CONTROLE
    WHEN a.is_control = 1 THEN 'CONTROLE'
    -- Pour les autres factures, déterminer le statut selon les paiements
    WHEN COALESCE(p.total_paid, 0) >= i.patient_responsibility THEN 'PAID'
    WHEN COALESCE(p.total_paid, 0) > 0 THEN 'PARTIAL'
    ELSE 'PENDING'
END;

-- Afficher les factures avec leur nouveau statut
SELECT id, invoice_number, patient_responsibility, status
FROM invoices
ORDER BY created_at DESC
LIMIT 10;
