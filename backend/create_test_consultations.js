const db = require('./src/config/database');

async function createTestConsultations() {
  try {
    console.log('Creating test consultations...');

    // Créer des dossiers médicaux pour les patients s'ils n'existent pas
    const patients = [1, 2, 3];
    for (const patientId of patients) {
      await db.execute(
        'INSERT IGNORE INTO medical_records (patient_id, created_by, created_at) VALUES (?, 1, NOW())',
        [patientId]
      );
    }

    // Récupérer les medical_record_id
    const [records] = await db.execute(
      'SELECT id, patient_id FROM medical_records WHERE patient_id IN (?, ?, ?)',
      [1, 2, 3]
    );

    console.log('Medical records:', records);

    // Créer des consultations en attente
    const consultations = [
      {
        patient_id: 1,
        chief_complaint: 'Fièvre et maux de tête',
        symptoms: 'Patient se plaint de fièvre depuis 3 jours, accompagnée de maux de tête intenses',
        notes: 'Constantes: T=38.5°C, TA=120/80, FC=85'
      },
      {
        patient_id: 2,
        chief_complaint: 'Douleurs abdominales',
        symptoms: 'Douleurs abdominales depuis hier soir, nausées',
        notes: 'Constantes: T=37.2°C, TA=115/75, FC=78, Poids=65kg'
      },
      {
        patient_id: 3,
        chief_complaint: 'Contrôle de routine',
        symptoms: 'Patient vient pour un contrôle de routine annuel',
        notes: 'Constantes: T=37.0°C, TA=125/82, FC=72, Poids=78kg, Glycémie=1.05'
      }
    ];

    for (const consultation of consultations) {
      const record = records.find(r => r.patient_id === consultation.patient_id);
      if (record) {
        await db.execute(
          `INSERT INTO medical_consultations
          (medical_record_id, patient_id, consultation_date, status, doctor_id, chief_complaint, symptoms, notes)
          VALUES (?, ?, NOW(), 'EN_ATTENTE', NULL, ?, ?, ?)`,
          [record.id, consultation.patient_id, consultation.chief_complaint, consultation.symptoms, consultation.notes]
        );
      }
    }

    // Vérifier les consultations créées
    const [result] = await db.execute(
      `SELECT
        mc.id,
        mc.consultation_date,
        mc.status,
        p.first_name,
        p.last_name,
        mc.chief_complaint
      FROM medical_consultations mc
      JOIN patients p ON mc.patient_id = p.id
      WHERE mc.status = 'EN_ATTENTE'`
    );

    console.log('\nConsultations en attente créées:', result.length);
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestConsultations();
