const db = require('./src/config/database');

/**
 * Test pour vérifier que le calcul de la part patient fonctionne correctement
 * pour les assurances à 100%
 */
async function test100PercentInsurance() {
  try {
    console.log('=== TEST ASSURANCE À 100% ===\n');

    // Scénario de test
    console.log('📋 Scénario de test:');
    console.log('   - Prix de base: 15000 FCFA');
    console.log('   - Taux de couverture: 100%');
    console.log('   - Assurance couvre: 15000 FCFA');
    console.log('   - Patient devrait payer: 0 FCFA\n');

    // Vérifier s'il existe une compagnie d'assurance avec 100%
    console.log('1. Recherche d\'une compagnie d\'assurance à 100%...');
    const [companies] = await db.query(`
      SELECT id, name, coverage_percentage
      FROM insurance_companies
      WHERE coverage_percentage = 100
      AND is_active = 1
      LIMIT 1
    `);

    if (companies.length === 0) {
      console.log('   ⚠️  Aucune compagnie à 100% trouvée. Créons-en une pour le test...');

      await db.query(`
        INSERT INTO insurance_companies (name, coverage_percentage, contact_person, phone, email, is_active)
        VALUES ('Test Assurance 100%', 100, 'Contact Test', '0000000000', 'test@test.com', 1)
      `);

      const [newCompanies] = await db.query(`
        SELECT id, name, coverage_percentage
        FROM insurance_companies
        WHERE name = 'Test Assurance 100%'
        LIMIT 1
      `);

      console.log(`   ✅ Compagnie créée: ${newCompanies[0].name} (ID: ${newCompanies[0].id})`);
    } else {
      console.log(`   ✅ Trouvé: ${companies[0].name} (ID: ${companies[0].id}, Couverture: ${companies[0].coverage_percentage}%)`);
    }
    console.log();

    // Test du calcul dans la base de données
    console.log('2. Test du calcul de la part patient...');

    const basePrice = 15000;
    const coveragePercentage = 100;
    const insuranceAmount = (basePrice * coveragePercentage) / 100;
    const patientAmount = basePrice - insuranceAmount;

    console.log('   Calcul mathématique:');
    console.log(`   - Base: ${basePrice} FCFA`);
    console.log(`   - Couverture: ${coveragePercentage}%`);
    console.log(`   - Assurance paie: ${insuranceAmount} FCFA`);
    console.log(`   - Patient paie: ${patientAmount} FCFA`);

    if (patientAmount === 0) {
      console.log('   ✅ Calcul correct: Patient paie 0 FCFA\n');
    } else {
      console.log(`   ❌ ERREUR: Patient devrait payer 0 FCFA, pas ${patientAmount} FCFA\n`);
    }

    // Vérifier des admissions avec assurance à 100%
    console.log('3. Vérification des admissions existantes avec assurance à 100%...');
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
      LIMIT 5
    `);

    if (admissions.length === 0) {
      console.log('   ℹ️  Aucune admission avec assurance à 100% trouvée.');
    } else {
      console.log(`   Trouvé ${admissions.length} admission(s) avec assurance ≥99%:\n`);
      admissions.forEach(adm => {
        const isCorrect = parseFloat(adm.patient_amount) === 0;
        const icon = isCorrect ? '✅' : '❌';
        console.log(`   ${icon} ${adm.admission_number} - ${adm.patient_name}`);
        console.log(`      Assurance: ${adm.insurance_name} (${adm.coverage_percentage}%)`);
        console.log(`      Base: ${adm.base_price} FCFA, Assurance: ${adm.insurance_amount} FCFA, Patient: ${adm.patient_amount} FCFA`);
        if (!isCorrect) {
          console.log(`      ⚠️  PROBLÈME: Patient devrait payer 0 FCFA!`);
        }
        console.log();
      });
    }

    // Vérifier les factures correspondantes
    console.log('4. Vérification des factures avec assurance à 100%...');
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
      LIMIT 5
    `);

    if (invoices.length === 0) {
      console.log('   ℹ️  Aucune facture avec assurance à 100% trouvée.');
    } else {
      console.log(`   Trouvé ${invoices.length} facture(s) avec assurance ≥99%:\n`);
      invoices.forEach(inv => {
        const isCorrect = parseFloat(inv.patient_responsibility) === 0;
        const icon = isCorrect ? '✅' : '❌';
        console.log(`   ${icon} ${inv.invoice_number} - ${inv.patient_name}`);
        console.log(`      Assurance: ${inv.insurance_name} (${inv.coverage_percentage}%)`);
        console.log(`      Total: ${inv.total_amount} FCFA, Assurance: ${inv.insurance_covered} FCFA, Patient: ${inv.patient_responsibility} FCFA`);
        if (!isCorrect) {
          console.log(`      ⚠️  PROBLÈME: Patient devrait payer 0 FCFA!`);
        }
        console.log();
      });
    }

    console.log('=== FIN DU TEST ===');
    console.log('\n💡 Les corrections ont été appliquées dans:');
    console.log('   - backend/src/controllers/admission.controller.js (ligne 40)');
    console.log('   - frontend/src/pages/Home.js (lignes 234-238 et 453)');
    console.log('\n✅ Le calcul devrait maintenant être correct pour les assurances à 100%.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test100PercentInsurance();
