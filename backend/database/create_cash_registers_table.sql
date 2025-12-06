-- Table pour les sessions de caisse
CREATE TABLE IF NOT EXISTS cash_registers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cashier_id INT NOT NULL,
  opening_date DATE NOT NULL,
  opening_time TIME NOT NULL,
  opening_amount DECIMAL(10,2) DEFAULT 0,
  closing_date DATE,
  closing_time TIME,
  closing_amount DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  difference DECIMAL(10,2),
  notes TEXT,
  status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_cashier_id (cashier_id),
  INDEX idx_status (status),
  INDEX idx_opening_date (opening_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter la colonne cash_register_id à la table payments
ALTER TABLE payments
ADD COLUMN cash_register_id INT AFTER invoice_id,
ADD INDEX idx_cash_register_id (cash_register_id),
ADD FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE SET NULL;
