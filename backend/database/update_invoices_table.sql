-- Ajouter admission_id et invoice_type à la table invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS admission_id INT,
ADD COLUMN IF NOT EXISTS invoice_type ENUM('TICKET', 'A4') DEFAULT 'TICKET',
ADD CONSTRAINT fk_invoices_admission FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admission_id ON invoices(admission_id);
