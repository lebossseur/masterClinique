-- Table pour les factures envoyées aux compagnies d'assurance
CREATE TABLE IF NOT EXISTS insurance_invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  insurance_company_id INT NOT NULL,
  invoice_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  total_invoices INT NOT NULL,
  status ENUM('DRAFT', 'SENT', 'PAID', 'PARTIAL') DEFAULT 'DRAFT',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table de liaison entre les factures d'assurance et les factures patients
CREATE TABLE IF NOT EXISTS insurance_invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  insurance_invoice_id INT NOT NULL,
  patient_invoice_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (insurance_invoice_id) REFERENCES insurance_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_invoice_id) REFERENCES invoices(id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_insurance_invoices_company ON insurance_invoices(insurance_company_id);
CREATE INDEX idx_insurance_invoices_period ON insurance_invoices(period_start, period_end);
CREATE INDEX idx_insurance_invoices_status ON insurance_invoices(status);
CREATE INDEX idx_insurance_invoice_items_insurance ON insurance_invoice_items(insurance_invoice_id);
CREATE INDEX idx_insurance_invoice_items_patient ON insurance_invoice_items(patient_invoice_id);
