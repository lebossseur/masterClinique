import React, { useState, useEffect } from 'react';
import { patientService, insuranceService, pricingService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaShieldAlt, FaEye, FaUser, FaCheck } from 'react-icons/fa';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModals, setShowModals] = useState(false);
  const [patientInsurances, setPatientInsurances] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientFormData, setPatientFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergency_contact: '',
    emergency_phone: '',
    numero_piece_identite: '',
    type_piece_identite: '',
    profession: '',
    nationalite: '',
    lieu_naissance: '',
    situation_matrimoniale: '',
    blood_type: '',
    allergies: '',
    medical_history: ''
  });

  const [insuranceFormData, setInsuranceFormData] = useState({
    insurance_company_id: '',
    policy_number: '',
    coverage_percentage: 70,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    loadPatients();
    loadInsuranceCompanies();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsuranceCompanies = async () => {
    try {
      const response = await pricingService.getAllInsuranceCompanies();
      setInsuranceCompanies(response.data.data);
    } catch (error) {
      console.error('Error loading insurance companies:', error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await patientService.search(query);
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    } else {
      loadPatients();
    }
  };

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    setShowModals(true);

    // Charger les assurances du patient
    try {
      const response = await insuranceService.getPatientInsurance(patient.id);
      setPatientInsurances(response.data.data);
    } catch (error) {
      console.error('Error loading patient insurances:', error);
      setPatientInsurances([]);
    }
  };

  const handleCloseModals = () => {
    setShowModals(false);
    setSelectedPatient(null);
    setPatientInsurances([]);
    setInsuranceFormData({
      insurance_company_id: '',
      policy_number: '',
      coverage_percentage: 70,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    });
  };

  const handleAddInsurance = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return;

    try {
      await insuranceService.addPatientInsurance({
        patient_id: selectedPatient.id,
        ...insuranceFormData
      });

      alert('Assurance ajoutée avec succès !');

      // Réinitialiser le formulaire
      setInsuranceFormData({
        insurance_company_id: '',
        policy_number: '',
        coverage_percentage: 70,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });

      // Recharger les assurances du patient
      const response = await insuranceService.getPatientInsurance(selectedPatient.id);
      setPatientInsurances(response.data.data);
    } catch (error) {
      console.error('Error adding insurance:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'ajout de l\'assurance';
      alert(errorMessage);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await patientService.create(patientFormData);
      alert('Patient créé avec succès !');
      setShowPatientForm(false);
      setEditingPatient(null);
      resetPatientForm();
      loadPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création du patient');
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      await patientService.update(editingPatient.id, patientFormData);
      alert('Patient modifié avec succès !');
      setShowPatientForm(false);
      setEditingPatient(null);
      resetPatientForm();
      loadPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification du patient');
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setPatientFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
      numero_piece_identite: patient.numero_piece_identite || '',
      type_piece_identite: patient.type_piece_identite || '',
      profession: patient.profession || '',
      nationalite: patient.nationalite || '',
      lieu_naissance: patient.lieu_naissance || '',
      situation_matrimoniale: patient.situation_matrimoniale || '',
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      medical_history: patient.medical_history || ''
    });
    setShowPatientForm(true);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await patientService.delete(patientId);
        alert('Patient supprimé avec succès !');
        loadPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression du patient');
      }
    }
  };

  const resetPatientForm = () => {
    setPatientFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergency_contact: '',
      emergency_phone: '',
      numero_piece_identite: '',
      type_piece_identite: '',
      profession: '',
      nationalite: '',
      lieu_naissance: '',
      situation_matrimoniale: '',
      blood_type: '',
      allergies: '',
      medical_history: ''
    });
  };

  if (loading) {
    return <div className="page-container">Chargement...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 0 }}>
            Gestion des Patients
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: '1rem', fontWeight: 500 }}>
            Liste de tous les patients enregistrés
          </p>
          <button className="btn btn-primary" onClick={() => {
            setEditingPatient(null);
            resetPatientForm();
            setShowPatientForm(true);
          }}>
            <FaPlus /> Nouveau Patient
          </button>
        </div>
      </div>

      <div className="card">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un patient (nom, prénom, numéro)..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Nom complet</th>
                <th>Date de naissance</th>
                <th>Genre</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td><strong>{patient.patient_number}</strong></td>
                    <td>{patient.first_name} {patient.last_name}</td>
                    <td>{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.phone || '-'}</td>
                    <td>{patient.email || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => handleViewPatient(patient)}
                      >
                        <FaEye /> Détails
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => handleEditPatient(patient)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeletePatient(patient.id)}
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

      {/* Modal Nouveau Patient */}
      {showPatientForm && (
        <div className="modal-overlay" onClick={() => {
          setShowPatientForm(false);
          setEditingPatient(null);
          resetPatientForm();
        }}>
          <div className="modal" style={{ maxWidth: '900px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUser /> {editingPatient ? 'Modifier Patient' : 'Nouveau Patient'}</h3>
              <button className="modal-close" onClick={() => {
                setShowPatientForm(false);
                setEditingPatient(null);
                resetPatientForm();
              }}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e40af' }}>Informations Personnelles</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={patientFormData.last_name}
                      onChange={(e) => setPatientFormData({...patientFormData, last_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={patientFormData.first_name}
                      onChange={(e) => setPatientFormData({...patientFormData, first_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date de Naissance *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={patientFormData.date_of_birth}
                      onChange={(e) => setPatientFormData({...patientFormData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre *</label>
                    <select
                      className="form-select"
                      required
                      value={patientFormData.gender}
                      onChange={(e) => setPatientFormData({...patientFormData, gender: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lieu de Naissance</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.lieu_naissance}
                      onChange={(e) => setPatientFormData({...patientFormData, lieu_naissance: e.target.value})}
                      placeholder="Ex: Yaoundé, Cameroun"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationalité</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.nationalite}
                      onChange={(e) => setPatientFormData({...patientFormData, nationalite: e.target.value})}
                      placeholder="Ex: Camerounaise"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type de Pièce d'Identité</label>
                    <select
                      className="form-select"
                      value={patientFormData.type_piece_identite}
                      onChange={(e) => setPatientFormData({...patientFormData, type_piece_identite: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="CNI">Carte Nationale d'Identité</option>
                      <option value="PASSPORT">Passeport</option>
                      <option value="PERMIS_CONDUIRE">Permis de Conduire</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de Pièce d'Identité</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.numero_piece_identite}
                      onChange={(e) => setPatientFormData({...patientFormData, numero_piece_identite: e.target.value})}
                      placeholder="Ex: 123456789"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Profession</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.profession}
                      onChange={(e) => setPatientFormData({...patientFormData, profession: e.target.value})}
                      placeholder="Ex: Enseignant"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Situation Matrimoniale</label>
                    <select
                      className="form-select"
                      value={patientFormData.situation_matrimoniale}
                      onChange={(e) => setPatientFormData({...patientFormData, situation_matrimoniale: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="CELIBATAIRE">Célibataire</option>
                      <option value="MARIE(E)">Marié(e)</option>
                      <option value="DIVORCE(E)">Divorcé(e)</option>
                      <option value="VEUF(VE)">Veuf(ve)</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#1e40af' }}>Contact</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={patientFormData.phone}
                      onChange={(e) => setPatientFormData({...patientFormData, phone: e.target.value})}
                      placeholder="Ex: +237 6XX XX XX XX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={patientFormData.email}
                      onChange={(e) => setPatientFormData({...patientFormData, email: e.target.value})}
                      placeholder="exemple@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.address}
                      onChange={(e) => setPatientFormData({...patientFormData, address: e.target.value})}
                      placeholder="Ex: Quartier Bastos"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.city}
                      onChange={(e) => setPatientFormData({...patientFormData, city: e.target.value})}
                      placeholder="Ex: Yaoundé"
                    />
                  </div>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#1e40af' }}>Contact d'Urgence</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom du Contact d'Urgence</label>
                    <input
                      type="text"
                      className="form-input"
                      value={patientFormData.emergency_contact}
                      onChange={(e) => setPatientFormData({...patientFormData, emergency_contact: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone d'Urgence</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={patientFormData.emergency_phone}
                      onChange={(e) => setPatientFormData({...patientFormData, emergency_phone: e.target.value})}
                      placeholder="Ex: +237 6XX XX XX XX"
                    />
                  </div>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#1e40af' }}>Informations Médicales</h4>
                <div className="form-group">
                  <label className="form-label">Groupe Sanguin</label>
                  <select
                    className="form-select"
                    value={patientFormData.blood_type}
                    onChange={(e) => setPatientFormData({...patientFormData, blood_type: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={patientFormData.allergies}
                    onChange={(e) => setPatientFormData({...patientFormData, allergies: e.target.value})}
                    placeholder="Liste des allergies connues..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Antécédents Médicaux</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={patientFormData.medical_history}
                    onChange={(e) => setPatientFormData({...patientFormData, medical_history: e.target.value})}
                    placeholder="Historique médical important..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowPatientForm(false);
                    setEditingPatient(null);
                    resetPatientForm();
                  }}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    <FaCheck /> {editingPatient ? 'Modifier' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modals côte à côte */}
      {showModals && selectedPatient && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modals-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Détails Patient */}
            <div className="modal modal-patient-details">
              <div className="modal-header">
                <h3><FaUser /> Détails du Patient</h3>
                <button className="modal-close" onClick={handleCloseModals}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="patient-detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Numéro Patient:</span>
                    <span className="detail-value">{selectedPatient.patient_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nom Complet:</span>
                    <span className="detail-value">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date de Naissance:</span>
                    <span className="detail-value">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Genre:</span>
                    <span className="detail-value">{selectedPatient.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Téléphone:</span>
                    <span className="detail-value">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedPatient.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Adresse:</span>
                    <span className="detail-value">{selectedPatient.address || 'N/A'}</span>
                  </div>
                </div>

                {/* Liste des assurances */}
                <div className="patient-insurances">
                  <h4><FaShieldAlt /> Assurances Enregistrées</h4>
                  {patientInsurances.length > 0 ? (
                    <div className="insurance-list">
                      {patientInsurances.map((insurance) => (
                        <div key={insurance.id} className="insurance-item">
                          <div className="insurance-company">{insurance.company_name}</div>
                          <div className="insurance-details">
                            <span>Police: {insurance.policy_number}</span>
                            <span>Couverture: {insurance.coverage_percentage}%</span>
                            <span>Validité: {new Date(insurance.start_date).toLocaleDateString()}{insurance.end_date && ` - ${new Date(insurance.end_date).toLocaleDateString()}`}</span>
                          </div>
                          {insurance.notes && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              <strong>Notes:</strong> {insurance.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">Aucune assurance enregistrée</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Ajout d'Assurance */}
            <div className="modal modal-add-insurance">
              <div className="modal-header">
                <h3><FaShieldAlt /> Ajouter une Assurance</h3>
                <button className="modal-close" onClick={handleCloseModals}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddInsurance}>
                  <div className="form-group">
                    <label className="form-label">Compagnie d'Assurance *</label>
                    <select
                      className="form-select"
                      required
                      value={insuranceFormData.insurance_company_id}
                      onChange={(e) => setInsuranceFormData({...insuranceFormData, insurance_company_id: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      {insuranceCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numéro de Police *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Ex: POL123456"
                      value={insuranceFormData.policy_number}
                      onChange={(e) => setInsuranceFormData({...insuranceFormData, policy_number: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Taux de Couverture (%) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Ex: 80"
                      value={insuranceFormData.coverage_percentage}
                      onChange={(e) => setInsuranceFormData({...insuranceFormData, coverage_percentage: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date de Début *</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={insuranceFormData.start_date}
                        onChange={(e) => setInsuranceFormData({...insuranceFormData, start_date: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date de Fin</label>
                      <input
                        type="date"
                        className="form-input"
                        value={insuranceFormData.end_date}
                        onChange={(e) => setInsuranceFormData({...insuranceFormData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      value={insuranceFormData.notes}
                      onChange={(e) => setInsuranceFormData({...insuranceFormData, notes: e.target.value})}
                      placeholder="Remarques ou informations complémentaires..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>
                      Fermer
                    </button>
                    <button type="submit" className="btn btn-success">
                      <FaCheck /> Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
