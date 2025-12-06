const db = require('../config/database');

exports.getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT d.*,
              CONCAT(u.first_name, ' ', u.last_name) as full_name,
              u.first_name as user_first_name,
              u.last_name as user_last_name
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des médecins.'
    });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT d.*,
              CONCAT(u.first_name, ' ', u.last_name) as full_name,
              u.first_name, u.last_name, u.email as user_email
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé.'
      });
    }

    res.json({
      success: true,
      data: doctors[0]
    });
  } catch (error) {
    console.error('Get doctor by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du médecin.'
    });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const {
      user_id,
      specialization,
      license_number,
      qualification,
      experience_years,
      consultation_fee,
      phone,
      email,
      is_active
    } = req.body;

    if (!specialization) {
      return res.status(400).json({
        success: false,
        message: 'La spécialisation est requise.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO doctors (user_id, specialization, license_number, qualification,
                           experience_years, consultation_fee, phone, email, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, specialization, license_number, qualification,
       experience_years, consultation_fee, phone, email, is_active !== false]
    );

    res.status(201).json({
      success: true,
      message: 'Médecin/Praticien créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du médecin.'
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      user_id,
      specialization,
      license_number,
      qualification,
      experience_years,
      consultation_fee,
      phone,
      email,
      is_active
    } = req.body;

    await db.query(
      `UPDATE doctors SET user_id = ?, specialization = ?, license_number = ?,
       qualification = ?, experience_years = ?, consultation_fee = ?,
       phone = ?, email = ?, is_active = ?
       WHERE id = ?`,
      [user_id || null, specialization, license_number, qualification,
       experience_years, consultation_fee, phone, email,
       is_active !== false, req.params.id]
    );

    res.json({
      success: true,
      message: 'Médecin/Praticien mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du médecin.'
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await db.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Médecin/Praticien supprimé avec succès.'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du médecin.'
    });
  }
};
