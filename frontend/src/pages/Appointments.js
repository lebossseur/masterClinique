import React, { useState, useEffect } from 'react';
import { appointmentService, patientService, doctorService } from '../services/api';
import { FaPlus, FaCalendarDay, FaEdit, FaTrash, FaTimes, FaSms } from 'react-icons/fa';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: '',
    send_sms: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ]);
      setAppointments(appointmentsResponse.data.data);
      setPatients(patientsResponse.data.data);
      // Filtrer uniquement les médecins actifs
      const doctorsList = doctorsResponse.data.data.filter(doctor => doctor.is_active);
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setEditingAppointment(null);
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
      notes: '',
      send_sms: true
    });
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id || '',
      appointment_date: appointment.appointment_date.split('T')[0],
      appointment_time: appointment.appointment_time,
      reason: appointment.reason || '',
      status: appointment.status,
      notes: appointment.notes || '',
      send_sms: true
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, formData);
        alert('Rendez-vous modifié avec succès !');
      } else {
        await appointmentService.create(formData);
        alert('Rendez-vous créé avec succès !');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement du rendez-vous';
      alert(errorMessage);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      await appointmentService.delete(id);
      alert('Rendez-vous supprimé avec succès !');
      loadData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Planifié', class: 'badge-info' },
      'CONFIRMED': { label: 'Confirmé', class: 'badge-success' },
      'COMPLETED': { label: 'Terminé', class: 'badge-secondary' },
      'CANCELLED': { label: 'Annulé', class: 'badge-danger' },
      'NO_SHOW': { label: 'Absent', class: 'badge-warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <div className="page-container">Chargement...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 0 }}>
            Gestion des Rendez-vous
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: '1rem', fontWeight: 500 }}>
            Liste de tous les rendez-vous
          </p>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <FaPlus /> Nouveau Rendez-vous
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FaCalendarDay /> Tous les rendez-vous
          </h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aucun rendez-vous trouvé
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                    <td>{appointment.appointment_time}</td>
                    <td>{appointment.patient_name}</td>
                    <td>{appointment.doctor_name || '-'}</td>
                    <td>{appointment.reason || '-'}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaCalendarDay /> {editingAppointment ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.last_name} {patient.first_name} - {patient.patient_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Médecin à voir *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.last_name} {doctor.first_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure *</label>
                  <input
                    type="time"
                    className="form-input"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  />
                </div>
              </div>

              {editingAppointment && (
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="SCHEDULED">Planifié</option>
                    <option value="CONFIRMED">Confirmé</option>
                    <option value="COMPLETED">Terminé</option>
                    <option value="CANCELLED">Annulé</option>
                    <option value="NO_SHOW">Absent</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Motif *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Consultation générale"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes supplémentaires..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.send_sms}
                    onChange={(e) => setFormData({ ...formData, send_sms: e.target.checked })}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaSms style={{ color: 'var(--primary-color)' }} />
                    Envoyer un SMS de confirmation au patient
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAppointment ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
