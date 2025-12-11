import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../services/api';
import { FaClock, FaUser, FaPlus, FaNotesMedical, FaEdit, FaCheck, FaFileAlt } from 'react-icons/fa';
import './Medicine.css';

const Medicine = () => {
  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [consultationForm, setConsultationForm] = useState({
    status: 'EN_COURS',
    chief_complaint: '',
    symptoms: '',
    diagnosis: '',
    treatment_plan: '',
    prescriptions: '',
    notes: '',
    follow_up_date: ''
  });

  useEffect(() => {
    loadPendingConsultations();
  }, []);

  const loadPendingConsultations = async () => {
    try {
      const response = await medicalRecordService.getPendingConsultations();
      setPendingConsultations(response.data.data);
    } catch (error) {
      console.error('Error loading pending consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsultation = async (consultation) => {
    setSelectedConsultation(consultation);
    setConsultationForm({
      status: 'EN_COURS',
      chief_complaint: consultation.chief_complaint || '',
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      treatment_plan: consultation.treatment_plan || '',
      prescriptions: consultation.prescriptions || '',
      notes: consultation.notes || '',
      follow_up_date: consultation.follow_up_date || ''
    });
    setShowConsultationModal(true);

    // Charger le dossier médical et l'historique du patient
    setLoadingHistory(true);
    try {
      // Charger le dossier médical
      const recordResponse = await medicalRecordService.getMedicalRecord(consultation.patient_id);
      setMedicalRecord(recordResponse.data.data);

      // Charger l'historique des consultations (exclure la consultation actuelle)
      const historyResponse = await medicalRecordService.getConsultations(consultation.patient_id);
      const history = historyResponse.data.data.filter(c => c.id !== consultation.id);
      setConsultationHistory(history);
    } catch (error) {
      console.error('Error loading patient medical history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateConsultation = async (markAsCompleted = false) => {
    try {
      const updateData = {
        ...consultationForm,
        consultation_date: selectedConsultation.consultation_date,
        status: markAsCompleted ? 'TERMINEE' : 'EN_COURS'
      };

      const response = await medicalRecordService.updateConsultation(selectedConsultation.id, updateData);

      if (markAsCompleted) {
        alert('Consultation terminée avec succès');
        setShowConsultationModal(false);
        // Recharger les consultations en attente
        loadPendingConsultations();
      } else {
        alert('Consultation sauvegardée');

        // Recharger la consultation mise à jour pour obtenir les dernières données
        const updatedConsultation = response.data.data;

        // Mettre à jour selectedConsultation avec les nouvelles données
        setSelectedConsultation(updatedConsultation);

        // Mettre à jour le formulaire avec les données sauvegardées
        setConsultationForm({
          status: 'EN_COURS',
          chief_complaint: updatedConsultation.chief_complaint || '',
          symptoms: updatedConsultation.symptoms || '',
          diagnosis: updatedConsultation.diagnosis || '',
          treatment_plan: updatedConsultation.treatment_plan || '',
          prescriptions: updatedConsultation.prescriptions || '',
          notes: updatedConsultation.notes || '',
          follow_up_date: updatedConsultation.follow_up_date || ''
        });

        // NE PAS recharger la liste des consultations en attente car le patient est encore en cours
        // La liste sera rechargée seulement quand on termine la consultation
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
      alert('Erreur lors de la mise à jour de la consultation');
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="medicine-container">
      <div className="page-header">
        <h1><FaNotesMedical /> Consultations Médicales</h1>
        <p className="subtitle">Consultations en attente de prise en charge</p>
      </div>

      {pendingConsultations.length === 0 ? (
        <div className="empty-state">
          <FaClock size={60} color="#95a5a6" />
          <h2>Aucune consultation en attente</h2>
          <p>Les nouvelles consultations apparaîtront ici</p>
        </div>
      ) : (
        <div className="consultations-grid">
          {pendingConsultations.map(consultation => (
            <div key={consultation.id} className="consultation-card">
              <div className="consultation-card-header">
                <div className="patient-info">
                  <div className="patient-avatar">
                    <FaUser />
                  </div>
                  <div>
                    <h3>{consultation.patient_first_name} {consultation.patient_last_name}</h3>
                    <p className="patient-number">N° {consultation.patient_number}</p>
                  </div>
                </div>
                <span className="status-badge status-pending">
                  <FaClock /> En attente
                </span>
              </div>

              <div className="consultation-card-body">
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDateTime(consultation.consultation_date)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Âge:</span>
                  <span className="value">{calculateAge(consultation.date_of_birth)} ans</span>
                </div>
                <div className="info-row">
                  <span className="label">Sexe:</span>
                  <span className="value">{consultation.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Motif:</span>
                  <span className="value complaint">{consultation.chief_complaint}</span>
                </div>
              </div>

              <div className="consultation-card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenConsultation(consultation)}
                >
                  <FaEdit /> Prendre en charge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConsultationModal && selectedConsultation && (
        <div className="modal-overlay" onClick={() => setShowConsultationModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaNotesMedical /> Consultation - {selectedConsultation.patient_first_name} {selectedConsultation.patient_last_name}
              </h2>
              <button className="modal-close" onClick={() => setShowConsultationModal(false)}>×</button>
            </div>

            <div className="patient-summary">
              <div className="summary-item">
                <strong>Patient:</strong> {selectedConsultation.patient_first_name} {selectedConsultation.patient_last_name}
              </div>
              <div className="summary-item">
                <strong>N° Dossier:</strong> {selectedConsultation.patient_number}
              </div>
              <div className="summary-item">
                <strong>Âge:</strong> {calculateAge(selectedConsultation.date_of_birth)} ans
              </div>
              <div className="summary-item">
                <strong>Date:</strong> {formatDateTime(selectedConsultation.consultation_date)}
              </div>
            </div>

            <div className="modal-body">
              {/* Section Dossier Médical et Historique */}
              {loadingHistory ? (
                <div className="loading-section">Chargement du dossier médical...</div>
              ) : (
                <>
                  {/* Antécédents Médicaux */}
                  {medicalRecord && (
                    <div className="medical-history-section">
                      <h3 style={{marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>
                        📋 Dossier Médical
                      </h3>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                        {medicalRecord.blood_type && (
                          <div style={{padding: '10px', background: '#f8f9fa', borderRadius: '5px'}}>
                            <strong>Groupe Sanguin:</strong> {medicalRecord.blood_type}
                          </div>
                        )}
                        {medicalRecord.allergies && (
                          <div style={{padding: '10px', background: '#fff3cd', borderRadius: '5px'}}>
                            <strong>Allergies:</strong> {medicalRecord.allergies}
                          </div>
                        )}
                        {medicalRecord.chronic_conditions && (
                          <div style={{padding: '10px', background: '#f8f9fa', borderRadius: '5px'}}>
                            <strong>Conditions Chroniques:</strong> {medicalRecord.chronic_conditions}
                          </div>
                        )}
                        {medicalRecord.current_medications && (
                          <div style={{padding: '10px', background: '#d1ecf1', borderRadius: '5px'}}>
                            <strong>Médicaments en Cours:</strong> {medicalRecord.current_medications}
                          </div>
                        )}
                        {medicalRecord.family_history && (
                          <div style={{padding: '10px', background: '#f8f9fa', borderRadius: '5px', gridColumn: '1 / -1'}}>
                            <strong>Antécédents Familiaux:</strong> {medicalRecord.family_history}
                          </div>
                        )}
                        {medicalRecord.notes && (
                          <div style={{padding: '10px', background: '#e7f3ff', borderRadius: '5px', gridColumn: '1 / -1'}}>
                            <strong>Notes:</strong> {medicalRecord.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Historique des Consultations */}
                  {consultationHistory.length > 0 && (
                    <div className="consultation-history-section">
                      <h3 style={{marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #27ae60', paddingBottom: '10px'}}>
                        📅 Historique des Consultations ({consultationHistory.length})
                      </h3>
                      <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '20px'}}>
                        {consultationHistory.map((cons, index) => (
                          <div key={cons.id} style={{
                            padding: '12px',
                            marginBottom: '10px',
                            background: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            borderLeft: '4px solid #27ae60'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                              <strong style={{color: '#27ae60'}}>
                                {formatDateTime(cons.consultation_date)}
                              </strong>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.85em',
                                background: cons.status === 'TERMINEE' ? '#d4edda' : '#fff3cd',
                                color: cons.status === 'TERMINEE' ? '#155724' : '#856404'
                              }}>
                                {cons.status === 'TERMINEE' ? 'Terminée' : cons.status === 'EN_COURS' ? 'En cours' : 'En attente'}
                              </span>
                            </div>
                            {cons.doctor_first_name && (
                              <div style={{fontSize: '0.9em', color: '#6c757d', marginBottom: '5px'}}>
                                Dr. {cons.doctor_first_name} {cons.doctor_last_name}
                              </div>
                            )}
                            {cons.chief_complaint && (
                              <div style={{marginBottom: '5px'}}>
                                <strong>Motif:</strong> {cons.chief_complaint}
                              </div>
                            )}
                            {cons.diagnosis && (
                              <div style={{marginBottom: '5px'}}>
                                <strong>Diagnostic:</strong> {cons.diagnosis}
                              </div>
                            )}
                            {cons.treatment_plan && (
                              <div style={{marginBottom: '5px'}}>
                                <strong>Traitement:</strong> {cons.treatment_plan}
                              </div>
                            )}
                            {cons.prescriptions && (
                              <div style={{marginBottom: '5px'}}>
                                <strong>Prescriptions:</strong> {cons.prescriptions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="consultation-form">
                <div className="form-section">
                  <h3><FaFileAlt /> Informations de base</h3>

                  <div className="form-group">
                    <label>Motif de Consultation *</label>
                    <textarea
                      rows="2"
                      value={consultationForm.chief_complaint}
                      onChange={(e) => setConsultationForm({...consultationForm, chief_complaint: e.target.value})}
                      placeholder="Raison de la consultation..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Symptômes</label>
                    <textarea
                      rows="3"
                      value={consultationForm.symptoms}
                      onChange={(e) => setConsultationForm({...consultationForm, symptoms: e.target.value})}
                      placeholder="Description détaillée des symptômes..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3><FaNotesMedical /> Diagnostic et Traitement</h3>

                  <div className="form-group">
                    <label>Diagnostic *</label>
                    <textarea
                      rows="3"
                      value={consultationForm.diagnosis}
                      onChange={(e) => setConsultationForm({...consultationForm, diagnosis: e.target.value})}
                      placeholder="Diagnostic médical..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Plan de Traitement</label>
                    <textarea
                      rows="3"
                      value={consultationForm.treatment_plan}
                      onChange={(e) => setConsultationForm({...consultationForm, treatment_plan: e.target.value})}
                      placeholder="Plan de traitement recommandé..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Ordonnance / Prescriptions</label>
                    <textarea
                      rows="4"
                      value={consultationForm.prescriptions}
                      onChange={(e) => setConsultationForm({...consultationForm, prescriptions: e.target.value})}
                      placeholder="Médicaments prescrits, posologie, durée..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes et Observations</label>
                    <textarea
                      rows="3"
                      value={consultationForm.notes}
                      onChange={(e) => setConsultationForm({...consultationForm, notes: e.target.value})}
                      placeholder="Notes additionnelles, recommandations..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Date de Suivi</label>
                    <input
                      type="date"
                      value={consultationForm.follow_up_date}
                      onChange={(e) => setConsultationForm({...consultationForm, follow_up_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowConsultationModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-info" onClick={() => handleUpdateConsultation(false)}>
                  <FaPlus /> Sauvegarder
                </button>
                <button className="btn btn-success" onClick={() => handleUpdateConsultation(true)}>
                  <FaCheck /> Terminer la Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicine;
