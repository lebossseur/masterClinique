-- Table pour les paiements
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  payment_time TIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE') NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  received_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_number (payment_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
