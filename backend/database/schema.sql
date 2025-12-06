-- Master Clinique Database Schema

CREATE DATABASE IF NOT EXISTS master_clinique;
USE master_clinique;

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des rôles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrateur du système'),
('SUPERVISOR', 'Superviseur avec accès complet'),
('ACCUEIL', 'Personnel d''accueil'),
('CAISSE', 'Personnel de caisse'),
('ASSURANCE', 'Personnel assurance'),
('PHARMACIE', 'Personnel pharmacie');

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('M', 'F', 'OTHER') NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  blood_type VARCHAR(5),
  allergies TEXT,
  medical_history TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des compagnies d'assurance
CREATE TABLE IF NOT EXISTS insurance_companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  coverage_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des assurances des patients
CREATE TABLE IF NOT EXISTS patient_insurance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  insurance_company_id INT NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  coverage_percentage DECIMAL(5,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id)
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des consultations
CREATE TABLE IF NOT EXISTS consultations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT,
  patient_id INT NOT NULL,
  consultation_date DATE NOT NULL,
  consultation_time TIME NOT NULL,
  diagnosis TEXT,
  symptoms TEXT,
  treatment TEXT,
  prescription TEXT,
  doctor_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des catégories de services
CREATE TABLE IF NOT EXISTS service_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  consultation_id INT,
  invoice_date DATE NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  insurance_covered DECIMAL(10,2) DEFAULT 0,
  patient_responsibility DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'PARTIAL', 'PAID', 'CANCELLED') DEFAULT 'PENDING',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (consultation_id) REFERENCES consultations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des lignes de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  service_id INT,
  description VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_id INT NOT NULL,
  payment_date DATE NOT NULL,
  payment_time TIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'CHEQUE', 'BANK_TRANSFER', 'INSURANCE') NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  received_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

-- Table des catégories de produits pharmaceutiques
CREATE TABLE IF NOT EXISTS pharmacy_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits pharmaceutiques
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  manufacturer VARCHAR(255),
  dosage VARCHAR(100),
  unit VARCHAR(50),
  unit_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  requires_prescription BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES pharmacy_categories(id)
);

-- Table des ventes de pharmacie
CREATE TABLE IF NOT EXISTS pharmacy_sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sale_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT,
  prescription_id INT,
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'CHEQUE', 'BANK_TRANSFER') NOT NULL,
  status ENUM('COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
  notes TEXT,
  sold_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (sold_by) REFERENCES users(id)
);

-- Table des lignes de vente de pharmacie
CREATE TABLE IF NOT EXISTS pharmacy_sale_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES pharmacy_sales(id),
  FOREIGN KEY (product_id) REFERENCES pharmacy_products(id)
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  movement_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_type VARCHAR(50),
  reference_id INT,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES pharmacy_products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des transactions comptables
CREATE TABLE IF NOT EXISTS accounting_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type ENUM('INCOME', 'EXPENSE') NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'CHEQUE', 'BANK_TRANSFER') NOT NULL,
  reference_type VARCHAR(50),
  reference_id INT,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_number VARCHAR(50) UNIQUE NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'CHEQUE', 'BANK_TRANSFER') NOT NULL,
  vendor VARCHAR(255),
  receipt_number VARCHAR(100),
  status ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED') DEFAULT 'PENDING',
  approved_by INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Création d'un utilisateur admin par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT INTO users (username, email, password, first_name, last_name, role_id)
VALUES ('admin', 'admin@masterclinique.com', '$2a$10$qemsn1V0UHsslISQ8uHhx.OBVbwcqoEmDB0l0kzhak93gtAUI7RLW', 'Admin', 'System', 1);
