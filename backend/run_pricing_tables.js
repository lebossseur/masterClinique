const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSQLScript() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'master_clinique',
    multipleStatements: true
  });

  try {
    const sqlFilePath = path.join(__dirname, 'create_pricing_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Exécution du script SQL...');
    await connection.query(sql);
    console.log('✓ Tables de tarification créées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script SQL:', error.message);
  } finally {
    await connection.end();
  }
}

runSQLScript();
