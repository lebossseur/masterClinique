const db = require('./src/config/database');

async function applyFix() {
  try {
    console.log('=== Application du correctif pour le statut CONTROLE ===\n');

    // 1. Vérifier la structure actuelle
    console.log('1. Vérification de la structure actuelle...');
    const [columns] = await db.query("SHOW COLUMNS FROM invoices LIKE 'status'");
    console.log('   Type actuel:', columns[0].Type);
    console.log();

    // 2. Modifier l'enum pour ajouter CONTROLE
    console.log('2. Modification de l\'enum pour ajouter CONTROLE...');
    await db.query(`
      ALTER TABLE invoices
      MODIFY COLUMN status ENUM('PENDING', 'PARTIAL', 'PAID', 'CONTROLE', 'CANCELLED') DEFAULT 'PENDING'
    `);
    console.log('   ✅ Enum modifié avec succès');
    console.log();

    // 3. Mettre à jour toutes les factures
    console.log('3. Mise à jour des statuts de factures...');
    const [updateResult] = await db.query(`
      UPDATE invoices i
      LEFT JOIN admissions a ON i.admission_id = a.id
      LEFT JOIN (
          SELECT invoice_id, COALESCE(SUM(amount), 0) as total_paid
          FROM payments
          GROUP BY invoice_id
      ) p ON i.id = p.invoice_id
      SET i.status = CASE
          WHEN a.is_control = 1 THEN 'CONTROLE'
          WHEN COALESCE(p.total_paid, 0) >= i.patient_responsibility THEN 'PAID'
          WHEN COALESCE(p.total_paid, 0) > 0 THEN 'PARTIAL'
          ELSE 'PENDING'
      END
    `);
    console.log(`   ✅ ${updateResult.affectedRows} facture(s) mise(s) à jour`);
    console.log();

    // 4. Vérifier les factures de contrôle
    console.log('4. Vérification des factures de contrôle...');
    const [controlInvoices] = await db.query(`
      SELECT
        i.invoice_number,
        i.status,
        i.patient_responsibility,
        a.is_control
      FROM invoices i
      JOIN admissions a ON i.admission_id = a.id
      WHERE a.is_control = 1
      ORDER BY i.created_at DESC
    `);

    console.log(`   Trouvé ${controlInvoices.length} facture(s) de contrôle:`);
    controlInvoices.forEach(inv => {
      const statusOK = inv.status === 'CONTROLE' ? '✅' : '❌';
      console.log(`   ${statusOK} ${inv.invoice_number} - Statut: ${inv.status} - Montant: ${inv.patient_responsibility} FCFA`);
    });
    console.log();

    // 5. Afficher un résumé par statut
    console.log('5. Résumé des factures par statut:');
    const [statusCount] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM invoices
      GROUP BY status
      ORDER BY status
    `);

    statusCount.forEach(row => {
      console.log(`   ${row.status}: ${row.count} facture(s)`);
    });
    console.log();

    console.log('=== Correctif appliqué avec succès! ===');
    console.log('\n✅ Les factures de contrôle s\'afficheront maintenant avec le badge "Contrôle" (vert) dans la liste.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'application du correctif:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyFix();
