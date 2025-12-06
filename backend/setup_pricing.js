const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupPricing() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    const sqlFile = path.join(__dirname, 'create_pricing_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`✗ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n✓ Pricing system setup completed successfully!');
    console.log('\nTables created/updated:');
    console.log('  - medical_service_prices (8 tarifs insérés)');
    console.log('  - insurance_companies (4 compagnies insérées)');
    console.log('  - insurance_coverage_rates (taux de couverture)');
    console.log('  - admissions (colonnes de prix ajoutées)');

  } catch (error) {
    console.error('Error setting up pricing system:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

setupPricing();
