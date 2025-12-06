const db = require('./src/config/database');

/**
 * Corrige les données des admissions et factures existantes
 * pour les patients assurés à 100% qui ont été mal calculées
 */
async function fix100PercentInsuranceData() {
  try {
    console.log('=== CORRECTION DES DONNÉES ASSURANCE 100% ===\n');

    // 1. Corriger les admissions
    console.log('1. Correction des admissions avec assurance à 100%...');

    const [updateAdmissions] = await db.query(`
      UPDATE admissions a
      SET
        a.insurance_amount = a.base_price,
        a.patient_amount = 0
      WHERE a.has_insurance = 1
        AND a.coverage_percentage >= 99
        AND a.is_control = 0
        AND a.patient_amount != 0
        AND a.base_price > 0
    `);

    console.log(`   ✅ ${updateAdmissions.affectedRows} admission(s) corrigée(s)`);
    console.log();

    // 2. Vérifier les admissions corrigées
    const [admissions] = await db.query(`
      SELECT
        a.admission_number,
        a.base_price,
        a.coverage_percentage,
        a.insurance_amount,
        a.patient_amount,
        ic.name as insurance_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name
      FROM admissions a
      LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.coverage_percentage >= 99
        AND a.has_insurance = 1
        AND a.is_control = 0
      ORDER BY a.created_at DESC
    `);

    if (admissions.length > 0) {
      console.log('   Admissions vérifiées:');
      admissions.forEach(adm => {
        const isCorrect = parseFloat(adm.patient_amount) === 0;
        const icon = isCorrect ? '✅' : '❌';
        console.log(`   ${icon} ${adm.admission_number} - ${adm.patient_name}`);
        console.log(`      Base: ${adm.base_price} FCFA, Assurance: ${adm.insurance_amount} FCFA, Patient: ${adm.patient_amount} FCFA`);
      });
      console.log();
    }

    // 3. Corriger les factures
    console.log('2. Correction des factures avec assurance à 100%...');

    const [updateInvoices] = await db.query(`
      UPDATE invoices i
      JOIN admissions a ON i.admission_id = a.id
      SET
        i.insurance_covered = i.total_amount,
        i.patient_responsibility = 0
      WHERE a.has_insurance = 1
        AND a.coverage_percentage >= 99
        AND a.is_control = 0
        AND i.patient_responsibility != 0
        AND i.total_amount > 0
    `);

    console.log(`   ✅ ${updateInvoices.affectedRows} facture(s) corrigée(s)`);
    console.log();

    // 4. Vérifier les factures corrigées
    const [invoices] = await db.query(`
      SELECT
        i.invoice_number,
        i.total_amount,
        i.insurance_covered,
        i.patient_responsibility,
        a.coverage_percentage,
        ic.name as insurance_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name
      FROM invoices i
      JOIN admissions a ON i.admission_id = a.id
      LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE a.coverage_percentage >= 99
        AND a.has_insurance = 1
        AND a.is_control = 0
      ORDER BY i.created_at DESC
    `);

    if (invoices.length > 0) {
      console.log('   Factures vérifiées:');
      invoices.forEach(inv => {
        const isCorrect = parseFloat(inv.patient_responsibility) === 0;
        const icon = isCorrect ? '✅' : '❌';
        console.log(`   ${icon} ${inv.invoice_number} - ${inv.patient_name}`);
        console.log(`      Total: ${inv.total_amount} FCFA, Assurance: ${inv.insurance_covered} FCFA, Patient: ${inv.patient_responsibility} FCFA`);
      });
      console.log();
    }

    // 5. Corriger les services d'admission
    console.log('3. Correction des services d\'admission avec assurance à 100%...');

    const [updateServices] = await db.query(`
      UPDATE admission_services asv
      JOIN admissions a ON asv.admission_id = a.id
      SET
        asv.insurance_covered = asv.base_price,
        asv.patient_pays = 0
      WHERE a.has_insurance = 1
        AND a.coverage_percentage >= 99
        AND a.is_control = 0
        AND asv.patient_pays != 0
        AND asv.base_price > 0
    `);

    console.log(`   ✅ ${updateServices.affectedRows} service(s) corrigé(s)`);
    console.log();

    console.log('=== CORRECTION TERMINÉE ===');
    console.log('\n✅ Toutes les admissions, factures et services avec assurance à 100%');
    console.log('   ont été corrigés. Le patient paie maintenant 0 FCFA comme prévu.');
    console.log('\n💡 Les nouvelles admissions avec assurance à 100% seront automatiquement');
    console.log('   calculées correctement grâce aux corrections dans le code.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fix100PercentInsuranceData();
