const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSQL() {
  let connection;

  try {
    // Créer une connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Connexion à MySQL réussie!');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'add_patient_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Exécution du script SQL...');
    await connection.query(sql);

    console.log('✅ Script exécuté avec succès!');
    console.log('Les nouveaux champs ont été ajoutés à la table patients.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion fermée.');
    }
  }
}

runSQL();
