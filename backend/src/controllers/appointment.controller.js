const db = require('../config/database');
const smsService = require('../services/sms.service');

exports.getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.*,
              CONCAT(p.last_name, ' ', p.first_name) as patient_name,
              p.patient_number,
              CONCAT('Dr. ', COALESCE(d.last_name, ''), ' ', COALESCE(d.first_name, '')) as doctor_name,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous.'
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.*,
              p.first_name as patient_first_name, p.last_name as patient_last_name,
              p.patient_number, p.phone as patient_phone,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé.'
      });
    }

    res.json({
      success: true,
      data: appointments[0]
    });
  } catch (error) {
    console.error('Get appointment by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rendez-vous.'
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes, send_sms } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis (patient, médecin, date, heure, motif).'
      });
    }

    // Récupérer les informations du patient
    const [patients] = await db.query(
      'SELECT first_name, last_name, phone FROM patients WHERE id = ?',
      [patient_id]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé.'
      });
    }

    const patient = patients[0];

    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, reason, notes, req.user.id]
    );

    // Envoyer un SMS de confirmation si demandé
    if (send_sms && patient.phone) {
      const patientName = `${patient.first_name} ${patient.last_name}`;
      const formattedDate = new Date(appointment_date).toLocaleDateString('fr-FR');

      await smsService.sendAppointmentConfirmation(
        patient.phone,
        patientName,
        formattedDate,
        appointment_time
      );
    }

    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rendez-vous.'
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes, send_sms } = req.body;

    // Récupérer l'ancien rendez-vous pour comparaison
    const [oldAppointments] = await db.query(
      `SELECT a.*, p.first_name, p.last_name, p.phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (oldAppointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé.'
      });
    }

    const oldAppointment = oldAppointments[0];
    const dateChanged = oldAppointment.appointment_date !== appointment_date ||
                       oldAppointment.appointment_time !== appointment_time;
    const statusChanged = oldAppointment.status !== status;

    await db.query(
      `UPDATE appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?,
       reason = ?, status = ?, notes = ? WHERE id = ?`,
      [patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes, req.params.id]
    );

    // Envoyer un SMS selon les changements
    if (send_sms && oldAppointment.phone) {
      const patientName = `${oldAppointment.first_name} ${oldAppointment.last_name}`;

      if (status === 'CANCELLED' && statusChanged) {
        // Rendez-vous annulé
        const formattedDate = new Date(oldAppointment.appointment_date).toLocaleDateString('fr-FR');
        await smsService.sendAppointmentCancellation(
          oldAppointment.phone,
          patientName,
          formattedDate,
          oldAppointment.appointment_time
        );
      } else if (dateChanged) {
        // Date/heure modifiée
        const oldDate = new Date(oldAppointment.appointment_date).toLocaleDateString('fr-FR');
        const newDate = new Date(appointment_date).toLocaleDateString('fr-FR');
        await smsService.sendAppointmentUpdate(
          oldAppointment.phone,
          patientName,
          oldDate,
          oldAppointment.appointment_time,
          newDate,
          appointment_time
        );
      }
    }

    res.json({
      success: true,
      message: 'Rendez-vous mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rendez-vous.'
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Rendez-vous supprimé avec succès.'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du rendez-vous.'
    });
  }
};

exports.getTodayAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.*,
              CONCAT(p.last_name, ' ', p.first_name) as patient_name,
              p.patient_number, p.phone as patient_phone,
              CONCAT('Dr. ', COALESCE(d.last_name, ''), ' ', COALESCE(d.first_name, '')) as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.appointment_date = CURDATE()
       ORDER BY a.appointment_time ASC`
    );

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous du jour.'
    });
  }
};
