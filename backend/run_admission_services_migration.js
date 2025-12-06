const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  let connection;
  try {
    // Créer la connexion
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'master_clinique',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'database', 'add_admission_services.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    console.log('Executing migration...');
    await connection.query(sql);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
