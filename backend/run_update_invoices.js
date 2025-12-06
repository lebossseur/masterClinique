const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'master_clinique',
      multipleStatements: true
    });

    console.log('Connected to database');

    const sqlPath = path.join(__dirname, 'database', 'update_invoices_table.sql');
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
