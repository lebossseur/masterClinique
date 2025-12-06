const db = require('./src/config/database');

async function testInvoiceStatus() {
  try {
    console.log('=== Test des statuts de factures ===\n');

    // 1. Vérifier si la colonne status existe
    console.log('1. Vérification de la colonne status...');
    const [columns] = await db.query("SHOW COLUMNS FROM invoices LIKE 'status'");

    if (columns.length === 0) {
      console.log('❌ La colonne status n\'existe PAS dans la table invoices');
      console.log('📝 Vous devez exécuter le script fix_invoice_status.sql\n');
    } else {
      console.log('✅ La colonne status existe');
      console.log('   Type:', columns[0].Type);
      console.log('   Default:', columns[0].Default);
      console.log();

      // 2. Compter les factures par statut
      console.log('2. Comptage des factures par statut:');
      const [statusCount] = await db.query(`
        SELECT
          status,
          COUNT(*) as count
        FROM invoices
        GROUP BY status
      `);

      statusCount.forEach(row => {
        console.log(`   ${row.status || 'NULL'}: ${row.count} facture(s)`);
      });
      console.log();

      // 3. Vérifier les factures de contrôle
      console.log('3. Factures de contrôle (is_control = 1):');
      const [controlInvoices] = await db.query(`
        SELECT
          i.invoice_number,
          i.status,
          i.patient_responsibility,
          a.is_control,
          a.admission_number
        FROM invoices i
        JOIN admissions a ON i.admission_id = a.id
        WHERE a.is_control = 1
        LIMIT 10
      `);

      if (controlInvoices.length === 0) {
        console.log('   Aucune facture de contrôle trouvée');
      } else {
        console.log(`   Trouvé ${controlInvoices.length} facture(s) de contrôle:`);
        controlInvoices.forEach(inv => {
          const statusOK = inv.status === 'CONTROLE' ? '✅' : '❌';
          console.log(`   ${statusOK} ${inv.invoice_number} - Statut: ${inv.status || 'NULL'} - Montant: ${inv.patient_responsibility} FCFA`);
        });
      }
      console.log();

      // 4. Vérifier toutes les factures
      console.log('4. Dernières factures (toutes):');
      const [allInvoices] = await db.query(`
        SELECT
          i.invoice_number,
          i.status,
          i.patient_responsibility,
          COALESCE(SUM(p.amount), 0) as total_paid,
          a.is_control
        FROM invoices i
        LEFT JOIN payments p ON i.id = p.invoice_id
        LEFT JOIN admissions a ON i.admission_id = a.id
        GROUP BY i.id
        ORDER BY i.created_at DESC
        LIMIT 10
      `);

      allInvoices.forEach(inv => {
        const isControl = inv.is_control ? '🔵 CONTRÔLE' : '';
        console.log(`   ${inv.invoice_number} - Statut: ${inv.status || 'NULL'} - À payer: ${inv.patient_responsibility} FCFA - Payé: ${inv.total_paid} FCFA ${isControl}`);
      });
    }

    console.log('\n=== Fin du test ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testInvoiceStatus();
