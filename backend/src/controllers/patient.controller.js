const db = require('../config/database');

exports.getAllPatients = async (req, res) => {
  try {
    const [patients] = await db.query(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM patients p
       LEFT JOIN users u ON p.created_by = u.id
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des patients.'
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const [patients] = await db.query(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM patients p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé.'
      });
    }

    const [insurance] = await db.query(
      `SELECT pi.*, ic.name as insurance_company_name
       FROM patient_insurance pi
       JOIN insurance_companies ic ON pi.insurance_company_id = ic.id
       WHERE pi.patient_id = ? AND pi.is_active = true`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...patients[0],
        insurance: insurance
      }
    });
  } catch (error) {
    console.error('Get patient by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du patient.'
    });
  }
};

exports.createPatient = async (req, res) => {
  try {
    console.log('=== CREATE PATIENT REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? req.user.id : 'NO USER');

    let {
      patient_number, first_name, last_name, date_of_birth, gender,
      phone, email, address, city, emergency_contact, emergency_phone,
      numero_piece_identite, type_piece_identite, profession, nationalite,
      lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history
    } = req.body;

    console.log('Validation check - first_name:', first_name, 'last_name:', last_name, 'date_of_birth:', date_of_birth, 'gender:', gender);

    if (!first_name || !last_name || !date_of_birth || !gender) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis (prénom, nom, date de naissance, genre).'
      });
    }

    // Générer automatiquement un numéro de patient si non fourni
    if (!patient_number) {
      console.log('Auto-generating patient number...');
      // Format: P + année + mois + jour + compteur (ex: P20231215001)
      const now = new Date();
      const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      console.log('Date prefix:', datePrefix);

      // Trouver le dernier numéro du jour
      const [todayPatients] = await db.query(
        'SELECT patient_number FROM patients WHERE patient_number LIKE ? ORDER BY patient_number DESC LIMIT 1',
        [`P${datePrefix}%`]
      );
      console.log('Today patients found:', todayPatients.length);

      let counter = 1;
      if (todayPatients.length > 0) {
        const lastNumber = todayPatients[0].patient_number;
        counter = parseInt(lastNumber.slice(-3)) + 1;
        console.log('Last patient number:', lastNumber, 'Next counter:', counter);
      }

      patient_number = `P${datePrefix}${String(counter).padStart(3, '0')}`;
      console.log('Generated patient number:', patient_number);
    } else {
      console.log('Patient number provided:', patient_number);
      // Vérifier si le numéro fourni existe déjà
      const [existingPatients] = await db.query(
        'SELECT id FROM patients WHERE patient_number = ?',
        [patient_number]
      );

      if (existingPatients.length > 0) {
        console.log('Patient number already exists');
        return res.status(400).json({
          success: false,
          message: 'Numéro de patient déjà existant.'
        });
      }
    }

    console.log('Attempting to insert patient with data:', {
      patient_number, first_name, last_name, date_of_birth, gender,
      phone, email, address, city, emergency_contact, emergency_phone,
      numero_piece_identite, type_piece_identite, profession, nationalite,
      lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history,
      created_by: req.user ? req.user.id : 'NO USER'
    });

    const [result] = await db.query(
      `INSERT INTO patients (patient_number, first_name, last_name, date_of_birth, gender,
       phone, email, address, city, emergency_contact, emergency_phone,
       numero_piece_identite, type_piece_identite, profession, nationalite,
       lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_number, first_name, last_name, date_of_birth, gender,
       phone, email, address, city, emergency_contact, emergency_phone,
       numero_piece_identite, type_piece_identite, profession, nationalite,
       lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history, req.user.id]
    );

    console.log('Insert successful, insertId:', result.insertId);

    // Récupérer le patient créé avec toutes ses informations
    const [newPatient] = await db.query(
      'SELECT * FROM patients WHERE id = ?',
      [result.insertId]
    );

    console.log('Patient retrieved successfully');

    res.status(201).json({
      success: true,
      message: 'Patient créé avec succès.',
      data: newPatient[0]
    });

    console.log('=== CREATE PATIENT SUCCESS ===');
  } catch (error) {
    console.error('=== CREATE PATIENT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du patient.',
      error: error.message
    });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const {
      patient_number, first_name, last_name, date_of_birth, gender,
      phone, email, address, city, emergency_contact, emergency_phone,
      numero_piece_identite, type_piece_identite, profession, nationalite,
      lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history
    } = req.body;

    const [existingPatients] = await db.query(
      'SELECT id FROM patients WHERE patient_number = ? AND id != ?',
      [patient_number, req.params.id]
    );

    if (existingPatients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de patient déjà existant.'
      });
    }

    await db.query(
      `UPDATE patients SET patient_number = ?, first_name = ?, last_name = ?,
       date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, city = ?,
       emergency_contact = ?, emergency_phone = ?, numero_piece_identite = ?,
       type_piece_identite = ?, profession = ?, nationalite = ?, lieu_naissance = ?,
       situation_matrimoniale = ?, blood_type = ?, allergies = ?, medical_history = ?
       WHERE id = ?`,
      [patient_number, first_name, last_name, date_of_birth, gender,
       phone, email, address, city, emergency_contact, emergency_phone,
       numero_piece_identite, type_piece_identite, profession, nationalite,
       lieu_naissance, situation_matrimoniale, blood_type, allergies, medical_history,
       req.params.id]
    );

    res.json({
      success: true,
      message: 'Patient mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du patient.'
    });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Patient supprimé avec succès.'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du patient.'
    });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    const [patients] = await db.query(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM patients p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.patient_number LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?
       OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des patients.'
    });
  }
};
