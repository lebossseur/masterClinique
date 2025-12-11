-- Script SQL pour améliorer le module Pharmacie
-- Date: 2025-12-08

-- Table des types de médicaments
CREATE TABLE IF NOT EXISTS medication_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des types de conservation
CREATE TABLE IF NOT EXISTS storage_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  temperature_range VARCHAR(50),
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des types d'emballage
CREATE TABLE IF NOT EXISTS packaging_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vérifier et créer la table pharmacy_categories si elle n'existe pas
CREATE TABLE IF NOT EXISTS pharmacy_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Améliorer la table pharmacy_products
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  medication_type_id INT,
  storage_type_id INT,
  packaging_type_id INT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  manufacturer VARCHAR(255),
  dosage VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'unité',
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  expiry_date DATE,
  batch_number VARCHAR(100),
  requires_prescription BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES pharmacy_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (medication_type_id) REFERENCES medication_types(id) ON DELETE SET NULL,
  FOREIGN KEY (storage_type_id) REFERENCES storage_types(id) ON DELETE SET NULL,
  FOREIGN KEY (packaging_type_id) REFERENCES packaging_types(id) ON DELETE SET NULL
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des entrées de stock (achats, commandes, dons)
CREATE TABLE IF NOT EXISTS stock_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_type ENUM('PURCHASE', 'ORDER', 'DONATION', 'OTHER') NOT NULL,
  supplier_id INT,
  entry_date DATE NOT NULL,
  invoice_number VARCHAR(100),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des items d'entrée de stock
CREATE TABLE IF NOT EXISTS stock_entry_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_entry_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_entry_id) REFERENCES stock_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES pharmacy_products(id) ON DELETE CASCADE
);

-- Table des sorties de stock (ventes, périmés, dons)
CREATE TABLE IF NOT EXISTS stock_exits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exit_number VARCHAR(50) UNIQUE NOT NULL,
  exit_type ENUM('SALE', 'EXPIRED', 'DONATION', 'DAMAGED', 'OTHER') NOT NULL,
  patient_id INT,
  exit_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  reason TEXT,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des items de sortie de stock
CREATE TABLE IF NOT EXISTS stock_exit_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_exit_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0,
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_exit_id) REFERENCES stock_exits(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES pharmacy_products(id) ON DELETE CASCADE
);

-- Table unifiée des mouvements de stock (pour traçabilité)
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  movement_type ENUM('IN', 'OUT') NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_type VARCHAR(50), -- 'ENTRY', 'EXIT', 'ADJUSTMENT'
  reference_id INT, -- ID de l'entrée ou sortie
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES pharmacy_products(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertion des données de référence

-- Types de médicaments
INSERT INTO medication_types (name, description) VALUES
('Comprimé', 'Médicament sous forme de comprimé solide'),
('Gélule', 'Médicament sous forme de gélule'),
('Sirop', 'Médicament liquide sucré'),
('Injection', 'Médicament injectable'),
('Suppositoire', 'Médicament à usage rectal'),
('Pommade', 'Médicament topique'),
('Crème', 'Médicament topique crémeux'),
('Gouttes', 'Médicament en gouttes'),
('Spray', 'Médicament en aérosol'),
('Poudre', 'Médicament en poudre')
ON DUPLICATE KEY UPDATE name=name;

-- Types de conservation
INSERT INTO storage_types (name, description, temperature_range) VALUES
('Température ambiante', 'Conservation à température ambiante', '15-25°C'),
('Réfrigéré', 'Conservation au réfrigérateur', '2-8°C'),
('Congelé', 'Conservation au congélateur', '-20°C'),
('Protégé de la lumière', 'À conserver à l\'abri de la lumière', '15-25°C'),
('Au sec', 'À conserver dans un endroit sec', '15-25°C')
ON DUPLICATE KEY UPDATE name=name;

-- Types d'emballage
INSERT INTO packaging_types (name, description) VALUES
('Boîte', 'Emballage en boîte carton'),
('Flacon', 'Flacon en plastique ou verre'),
('Blister', 'Plaquette thermoformée'),
('Sachet', 'Sachet en plastique ou aluminium'),
('Tube', 'Tube en aluminium ou plastique'),
('Ampoule', 'Ampoule en verre'),
('Seringue pré-remplie', 'Seringue prête à l\'emploi'),
('Pot', 'Pot en plastique ou verre')
ON DUPLICATE KEY UPDATE name=name;

-- Catégories de base
INSERT INTO pharmacy_categories (name, description) VALUES
('Antalgiques', 'Médicaments contre la douleur'),
('Antibiotiques', 'Médicaments antibactériens'),
('Anti-inflammatoires', 'Médicaments contre l\'inflammation'),
('Antipaludéens', 'Médicaments contre le paludisme'),
('Antihypertenseurs', 'Médicaments contre l\'hypertension'),
('Antidiabétiques', 'Médicaments contre le diabète'),
('Vitamines', 'Compléments vitaminiques'),
('Antiseptiques', 'Produits désinfectants')
ON DUPLICATE KEY UPDATE name=name;

-- Index pour améliorer les performances
CREATE INDEX idx_pharmacy_products_code ON pharmacy_products(code);
CREATE INDEX idx_pharmacy_products_name ON pharmacy_products(name);
CREATE INDEX idx_pharmacy_products_expiry ON pharmacy_products(expiry_date);
CREATE INDEX idx_stock_entries_date ON stock_entries(entry_date);
CREATE INDEX idx_stock_exits_date ON stock_exits(exit_date);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
