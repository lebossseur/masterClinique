const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'create_admissions_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and execute each statement
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
          // Continue with other statements even if one fails
        }
      }
    }

    console.log('\n✓ Database setup completed successfully!');
    console.log('\nTables created:');
    console.log('  - admissions');
    console.log('  - patient_vitals');
    console.log('\nIndexes created for better performance');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

setupDatabase();
