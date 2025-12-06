const mysql = require('mysql2/promise');

async function fixInsuranceTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'master_clinique'
  });

  try {
    console.log('Vérification et création des tables...');

    // 1. Créer la table medical_service_prices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS medical_service_prices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_code VARCHAR(50) UNIQUE NOT NULL,
        service_name VARCHAR(200) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table medical_service_prices créée');

    // 2. Vérifier et ajouter la colonne coverage_percentage à insurance_companies
    await connection.query(`
      ALTER TABLE insurance_companies
      ADD COLUMN IF NOT EXISTS coverage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Taux de couverture par défaut (0-100%)'
    `);
    console.log('✓ Colonne coverage_percentage ajoutée à insurance_companies');

    // 3. Créer la table insurance_coverage_rates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS insurance_coverage_rates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        insurance_company_id INT NOT NULL,
        service_code VARCHAR(50) NOT NULL,
        coverage_percentage DECIMAL(5,2) NOT NULL COMMENT 'Taux de couverture en pourcentage (0-100)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id) ON DELETE CASCADE,
        UNIQUE KEY unique_insurance_service (insurance_company_id, service_code)
      )
    `);
    console.log('✓ Table insurance_coverage_rates créée');

    // 4. Insérer les tarifs par défaut
    await connection.query(`
      INSERT INTO medical_service_prices (service_code, service_name, base_price, description) VALUES
      ('CONSULTATION_GENERALE', 'Consultation Générale', 5000.00, 'Consultation médicale générale'),
      ('CONSULTATION_PRENATALE', 'Consultation Prénatale', 7000.00, 'Consultation de suivi de grossesse'),
      ('CONSULTATION_GYNECOLOGIQUE', 'Consultation Gynécologique', 8000.00, 'Consultation gynécologique'),
      ('RADIOGRAPHIE', 'Radiographie', 15000.00, 'Examen radiographique'),
      ('EXAMENS_MEDICAUX', 'Examens Médicaux', 10000.00, 'Examens médicaux et analyses'),
      ('URGENCE', 'Urgence', 12000.00, 'Prise en charge d urgence'),
      ('CHIRURGIE', 'Chirurgie', 50000.00, 'Intervention chirurgicale'),
      ('AUTRE', 'Autre Acte', 5000.00, 'Autre type de consultation ou acte')
      ON DUPLICATE KEY UPDATE base_price = VALUES(base_price)
    `);
    console.log('✓ Tarifs des actes médicaux insérés');

    // 5. Mettre à jour les compagnies d'assurance avec coverage_percentage
    await connection.query(`
      UPDATE insurance_companies
      SET coverage_percentage = CASE
        WHEN name LIKE '%NSIA%' THEN 70.00
        WHEN name LIKE '%SUNU%' THEN 80.00
        WHEN name LIKE '%Allianz%' THEN 75.00
        WHEN name LIKE '%SONAR%' THEN 60.00
        ELSE 70.00
      END
      WHERE coverage_percentage = 0.00 OR coverage_percentage IS NULL
    `);
    console.log('✓ Taux de couverture par défaut mis à jour pour les compagnies');

    // 6. Ajouter les colonnes de tarification dans admissions
    await connection.query(`
      ALTER TABLE admissions
      ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Prix de base de l acte',
      ADD COLUMN IF NOT EXISTS insurance_company_id INT NULL COMMENT 'Compagnie d assurance',
      ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100) NULL COMMENT 'Numéro de police d assurance',
      ADD COLUMN IF NOT EXISTS coverage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Taux de couverture appliqué (%)',
      ADD COLUMN IF NOT EXISTS insurance_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant pris en charge par assurance',
      ADD COLUMN IF NOT EXISTS patient_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant à payer par le patient'
    `);
    console.log('✓ Colonnes de tarification ajoutées à admissions');

    console.log('\n✓✓✓ Toutes les tables ont été créées avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

fixInsuranceTables();
