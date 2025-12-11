const db = require('./src/config/database');

async function testPendingConsultations() {
  try {
    const [consultations] = await db.execute(
      `SELECT mc.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        p.patient_number, p.date_of_birth, p.gender,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      JOIN patients p ON mc.patient_id = p.id
      LEFT JOIN users u ON mc.doctor_id = u.id
      WHERE mc.status = 'EN_ATTENTE'
      ORDER BY mc.consultation_date ASC`
    );

    console.log('Nombre de consultations en attente:', consultations.length);
    console.log('\nRéponse API:');
    console.log(JSON.stringify({
      success: true,
      data: consultations
    }, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPendingConsultations();
