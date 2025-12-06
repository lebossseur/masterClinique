const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'master_clinique',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Connexion réussie !');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'add_health_center_and_doctors.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');

    console.log('Exécution de la migration...');
    await connection.query(sql);

    console.log('✓ Migration terminée avec succès !');
    console.log('✓ Tables health_center et doctors créées/mises à jour');

  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
