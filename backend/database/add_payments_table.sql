-- Table pour enregistrer les paiements des factures
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK') NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
