const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    // Créer la connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('Connected to database');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'create_insurance_invoices.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL migration...');

    // Exécuter le SQL
    await connection.query(sql);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Tables created: insurance_invoices, insurance_invoice_items');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
