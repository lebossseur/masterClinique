const db = require('../config/database');

// Obtenir ou créer le dossier médical d'un patient
const getMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [records] = await db.execute(
      `SELECT mr.*,
        p.first_name, p.last_name, p.patient_number, p.date_of_birth, p.gender,
        u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN users u ON mr.created_by = u.id
      WHERE mr.patient_id = ?`,
      [patientId]
    );

    if (records.length === 0) {
      // Créer un nouveau dossier médical vide
      const [result] = await db.execute(
        `INSERT INTO medical_records (patient_id, created_by) VALUES (?, ?)`,
        [patientId, req.user.userId]
      );

      const [newRecord] = await db.execute(
        `SELECT mr.*,
          p.first_name, p.last_name, p.patient_number, p.date_of_birth, p.gender
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        WHERE mr.id = ?`,
        [result.insertId]
      );

      return res.json({
        success: true,
        data: newRecord[0]
      });
    }

    res.json({
      success: true,
      data: records[0]
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dossier médical',
      error: error.message
    });
  }
};

// Mettre à jour le dossier médical
const updateMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      blood_type,
      allergies,
      chronic_conditions,
      current_medications,
      family_history,
      notes
    } = req.body;

    // Vérifier si le dossier existe
    const [existing] = await db.execute(
      'SELECT id FROM medical_records WHERE patient_id = ?',
      [patientId]
    );

    if (existing.length === 0) {
      // Créer le dossier s'il n'existe pas
      await db.execute(
        `INSERT INTO medical_records
        (patient_id, blood_type, allergies, chronic_conditions, current_medications, family_history, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [patientId, blood_type, allergies, chronic_conditions, current_medications, family_history, notes, req.user.userId]
      );
    } else {
      // Mettre à jour le dossier existant
      await db.execute(
        `UPDATE medical_records
        SET blood_type = ?, allergies = ?, chronic_conditions = ?,
            current_medications = ?, family_history = ?, notes = ?
        WHERE patient_id = ?`,
        [blood_type, allergies, chronic_conditions, current_medications, family_history, notes, patientId]
      );
    }

    // Récupérer le dossier mis à jour
    const [updated] = await db.execute(
      `SELECT mr.*, p.first_name, p.last_name, p.patient_number
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      WHERE mr.patient_id = ?`,
      [patientId]
    );

    res.json({
      success: true,
      message: 'Dossier médical mis à jour avec succès',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du dossier médical',
      error: error.message
    });
  }
};

// Obtenir toutes les consultations d'un patient
const getConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [consultations] = await db.execute(
      `SELECT mc.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      JOIN patients p ON mc.patient_id = p.id
      LEFT JOIN users u ON mc.doctor_id = u.id
      WHERE mc.patient_id = ?
      ORDER BY mc.consultation_date DESC`,
      [patientId]
    );

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des consultations',
      error: error.message
    });
  }
};

// Obtenir toutes les consultations en attente (pour les médecins)
const getPendingConsultations = async (req, res) => {
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

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching pending consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des consultations en attente',
      error: error.message
    });
  }
};

// Obtenir toutes les consultations (pour le dashboard)
const getAllConsultations = async (req, res) => {
  try {
    const [consultations] = await db.execute(
      `SELECT mc.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        p.patient_number, p.date_of_birth, p.gender,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      JOIN patients p ON mc.patient_id = p.id
      LEFT JOIN users u ON mc.doctor_id = u.id
      ORDER BY mc.consultation_date DESC`
    );

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching all consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des consultations',
      error: error.message
    });
  }
};

// Créer une nouvelle consultation
const createConsultation = async (req, res) => {
  try {
    console.log('=== CREATE CONSULTATION REQUEST ===');
    console.log('Patient ID:', req.params.patientId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { patientId } = req.params;
    const {
      consultation_date,
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      prescriptions,
      notes,
      follow_up_date,
      status
    } = req.body;

    // Vérifier si le dossier médical existe, sinon le créer
    const [medicalRecord] = await db.execute(
      'SELECT id FROM medical_records WHERE patient_id = ?',
      [patientId]
    );

    let medicalRecordId;
    if (medicalRecord.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO medical_records (patient_id, created_by) VALUES (?, ?)',
        [patientId, req.user ? req.user.id : null]
      );
      medicalRecordId = result.insertId;
    } else {
      medicalRecordId = medicalRecord[0].id;
    }

    // Créer la consultation
    const consultationStatus = status || 'EN_ATTENTE';
    const doctorId = consultationStatus === 'EN_ATTENTE' ? null : (req.user ? req.user.id : null); // Le médecin est assigné quand il prend en charge

    // Formater la date pour MySQL
    const formattedDate = consultation_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Convertir les chaînes vides en null
    const cleanValue = (val) => (val === '' || val === undefined) ? null : val;

    const params = [
      medicalRecordId,
      patientId,
      formattedDate,
      consultationStatus,
      doctorId,
      chief_complaint || '',
      cleanValue(symptoms),
      cleanValue(diagnosis),
      cleanValue(treatment_plan),
      cleanValue(prescriptions),
      cleanValue(notes),
      cleanValue(follow_up_date)
    ];

    console.log('SQL Parameters:', params);
    console.log('Parameters types:', params.map(p => typeof p));

    const [result] = await db.execute(
      `INSERT INTO medical_consultations
      (medical_record_id, patient_id, consultation_date, status, doctor_id, chief_complaint,
       symptoms, diagnosis, treatment_plan, prescriptions, notes, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    // Récupérer la consultation créée
    const [consultation] = await db.execute(
      `SELECT mc.*,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      LEFT JOIN users u ON mc.doctor_id = u.id
      WHERE mc.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Consultation créée avec succès',
      data: consultation[0]
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la consultation',
      error: error.message
    });
  }
};

// Obtenir une consultation spécifique
const getConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const [consultations] = await db.execute(
      `SELECT mc.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      JOIN patients p ON mc.patient_id = p.id
      LEFT JOIN users u ON mc.doctor_id = u.id
      WHERE mc.id = ?`,
      [consultationId]
    );

    if (consultations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultation non trouvée'
      });
    }

    res.json({
      success: true,
      data: consultations[0]
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la consultation',
      error: error.message
    });
  }
};

// Mettre à jour une consultation
const updateConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const {
      consultation_date,
      status,
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      prescriptions,
      notes,
      follow_up_date
    } = req.body;

    console.log('=== UPDATE CONSULTATION DEBUG ===');
    console.log('consultationId:', consultationId);
    console.log('req.user:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Convertir les chaînes vides et undefined en null
    const cleanValue = (val) => (val === '' || val === undefined) ? null : val;

    // Si le statut passe à EN_COURS et qu'il n'y a pas de médecin assigné, assigner le médecin actuel
    let updateQuery = `UPDATE medical_consultations
      SET consultation_date = ?, status = ?, chief_complaint = ?, symptoms = ?,
          diagnosis = ?, treatment_plan = ?, prescriptions = ?,
          notes = ?, follow_up_date = ?`;

    let params = [
      cleanValue(consultation_date),
      status || 'EN_ATTENTE',
      chief_complaint || '',
      cleanValue(symptoms),
      cleanValue(diagnosis),
      cleanValue(treatment_plan),
      cleanValue(prescriptions),
      cleanValue(notes),
      cleanValue(follow_up_date)
    ];

    if (status === 'EN_COURS') {
      updateQuery += `, doctor_id = COALESCE(doctor_id, ?)`;
      params.push(req.user ? req.user.id : null);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(consultationId);

    console.log('SQL Query:', updateQuery);
    console.log('Parameters:', params);
    console.log('Parameters types:', params.map(p => typeof p));

    await db.execute(updateQuery, params);

    const [updated] = await db.execute(
      `SELECT mc.*,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_consultations mc
      LEFT JOIN users u ON mc.doctor_id = u.id
      WHERE mc.id = ?`,
      [consultationId]
    );

    res.json({
      success: true,
      message: 'Consultation mise à jour avec succès',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la consultation',
      error: error.message
    });
  }
};

// Supprimer une consultation
const deleteConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;

    await db.execute('DELETE FROM medical_consultations WHERE id = ?', [consultationId]);

    res.json({
      success: true,
      message: 'Consultation supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la consultation',
      error: error.message
    });
  }
};

module.exports = {
  getMedicalRecord,
  updateMedicalRecord,
  getConsultations,
  getPendingConsultations,
  getAllConsultations,
  createConsultation,
  getConsultation,
  updateConsultation,
  deleteConsultation
};
