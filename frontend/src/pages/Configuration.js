import React, { useState, useEffect } from 'react';
import { userService, pricingService, healthCenterService, doctorService } from '../services/api';
import { FaCog, FaUser, FaFileInvoice, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaHospital, FaUserMd } from 'react-icons/fa';
import './Configuration.css';

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Liste des spécialisations médicales
  const specializations = [
    'Médecine Générale',
    'Pédiatrie',
    'Gynécologie',
    'Obstétrique',
    'Cardiologie',
    'Dermatologie',
    'Ophtalmologie',
    'ORL (Oto-Rhino-Laryngologie)',
    'Chirurgie Générale',
    'Chirurgie Orthopédique',
    'Neurologie',
    'Psychiatrie',
    'Radiologie',
    'Anesthésie-Réanimation',
    'Gastro-entérologie',
    'Néphrologie',
    'Urologie',
    'Pneumologie',
    'Rhumatologie',
    'Endocrinologie',
    'Hématologie',
    'Oncologie',
    'Médecine Interne',
    'Infectiologie',
    'Sage-femme',
    'Infirmier(ère)',
    'Kinésithérapeute',
    'Dentiste',
    'Pharmacien(ne)',
    'Autre'
  ];

  // États pour les utilisateurs
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true
  });

  // États pour les actes médicaux
  const [medicalServices, setMedicalServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    service_code: '',
    service_name: '',
    base_price: '',
    description: '',
    is_active: true
  });

  // États pour le centre de santé
  const [healthCenterData, setHealthCenterData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    city: '',
    logo_url: ''
  });

  // États pour les médecins
  const [doctors, setDoctors] = useState([]);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorFormData, setDoctorFormData] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    specialization: '',
    license_number: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
      loadRoles();
    } else if (activeTab === 'services') {
      loadMedicalServices();
    } else if (activeTab === 'healthcenter') {
      loadHealthCenter();
    } else if (activeTab === 'doctors') {
      loadDoctors();
      loadUsers(); // Pour la liste déroulante des utilisateurs
    }
  }, [activeTab]);

  // Fonctions pour les utilisateurs
  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.create(userFormData);
      alert('Utilisateur créé avec succès !');
      setShowUserForm(false);
      resetUserForm();
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.update(editingUser.id, userFormData);
      alert('Utilisateur modifié avec succès !');
      setEditingUser(null);
      setShowUserForm(false);
      resetUserForm();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.delete(userId);
        alert('Utilisateur supprimé avec succès !');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_name || user.role,
      is_active: user.is_active
    });
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: '',
      is_active: true
    });
  };

  // Fonctions pour les actes médicaux
  const loadMedicalServices = async () => {
    try {
      const response = await pricingService.getAllPrices();
      setMedicalServices(response.data.data || []);
    } catch (error) {
      console.error('Error loading medical services:', error);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await pricingService.createPrice(serviceFormData);
      alert('Acte médical créé avec succès !');
      setShowServiceForm(false);
      resetServiceForm();
      loadMedicalServices();
    } catch (error) {
      console.error('Error creating service:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'acte');
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await pricingService.updatePrice(editingService.id, serviceFormData);
      alert('Acte médical modifié avec succès !');
      setEditingService(null);
      setShowServiceForm(false);
      resetServiceForm();
      loadMedicalServices();
    } catch (error) {
      console.error('Error updating service:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification de l\'acte');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      service_code: service.service_code,
      service_name: service.service_name,
      base_price: service.base_price,
      description: service.description || '',
      is_active: service.is_active
    });
    setShowServiceForm(true);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      service_code: '',
      service_name: '',
      base_price: '',
      description: '',
      is_active: true
    });
  };

  // Fonctions pour le centre de santé
  const loadHealthCenter = async () => {
    try {
      const response = await healthCenterService.get();
      if (response.data.data) {
        setHealthCenterData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading health center:', error);
    }
  };

  const handleSaveHealthCenter = async (e) => {
    e.preventDefault();
    try {
      await healthCenterService.update(healthCenterData);
      alert('Informations du centre mises à jour avec succès !');
      loadHealthCenter();
    } catch (error) {
      console.error('Error updating health center:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Fonctions pour les médecins
  const loadDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await doctorService.create(doctorFormData);
      alert('Médecin/Praticien créé avec succès !');
      setShowDoctorForm(false);
      resetDoctorForm();
      loadDoctors();
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      await doctorService.update(editingDoctor.id, doctorFormData);
      alert('Médecin/Praticien modifié avec succès !');
      setEditingDoctor(null);
      setShowDoctorForm(false);
      resetDoctorForm();
      loadDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin/praticien ?')) {
      try {
        await doctorService.delete(doctorId);
        alert('Médecin/Praticien supprimé avec succès !');
        loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorFormData({
      user_id: doctor.user_id || '',
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      specialization: doctor.specialization,
      license_number: doctor.license_number || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || '',
      consultation_fee: doctor.consultation_fee || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      is_active: doctor.is_active
    });
    setShowDoctorForm(true);
  };

  const resetDoctorForm = () => {
    setDoctorFormData({
      user_id: '',
      first_name: '',
      last_name: '',
      specialization: '',
      license_number: '',
      qualification: '',
      experience_years: '',
      consultation_fee: '',
      phone: '',
      email: '',
      is_active: true
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><FaCog /> Configuration</h1>
          <p>Gestion des paramètres du système</p>
        </div>
      </div>

      <div className="card">
        <div className="config-tabs">
          <button
            className={`config-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUser /> Utilisateurs
          </button>
          <button
            className={`config-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <FaFileInvoice /> Actes Médicaux
          </button>
          <button
            className={`config-tab ${activeTab === 'healthcenter' ? 'active' : ''}`}
            onClick={() => setActiveTab('healthcenter')}
          >
            <FaHospital /> Centre de Santé
          </button>
          <button
            className={`config-tab ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <FaUserMd /> Médecins/Praticiens
          </button>
        </div>

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="config-content">
            <div className="config-header">
              <h2>Gestion des Utilisateurs</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetUserForm();
                  setEditingUser(null);
                  setShowUserForm(true);
                }}
              >
                <FaPlus /> Nouvel Utilisateur
              </button>
            </div>

            {showUserForm && (
              <div className="form-card">
                <div className="form-card-header">
                  <h3>{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      resetUserForm();
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nom d'utilisateur *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={userFormData.username}
                        onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                        disabled={editingUser !== null}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={userFormData.first_name}
                        onChange={(e) => setUserFormData({...userFormData, first_name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={userFormData.last_name}
                        onChange={(e) => setUserFormData({...userFormData, last_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Mot de passe {!editingUser && '*'}</label>
                      <input
                        type="password"
                        className="form-input"
                        required={!editingUser}
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                        placeholder={editingUser ? "Laisser vide pour ne pas changer" : ""}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rôle *</label>
                      <select
                        className="form-select"
                        required
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                      >
                        <option value="">Sélectionner...</option>
                        {roles.map((role) => {
                          // Gérer le cas où role est un objet ou une string
                          const roleName = typeof role === 'string' ? role : role.name;
                          return <option key={roleName} value={roleName}>{roleName}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={userFormData.is_active}
                        onChange={(e) => setUserFormData({...userFormData, is_active: e.target.checked})}
                      />
                      <span>Compte actif</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                        resetUserForm();
                      }}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-success">
                      <FaSave /> Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom d'utilisateur</th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.username}</strong></td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge badge-primary">{user.role_name || user.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ marginRight: '0.5rem' }}
                            onClick={() => handleEditUser(user)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user.id)}
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
        )}

        {/* Onglet Actes Médicaux */}
        {activeTab === 'services' && (
          <div className="config-content">
            <div className="config-header">
              <h2>Gestion des Actes Médicaux</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetServiceForm();
                  setEditingService(null);
                  setShowServiceForm(true);
                }}
              >
                <FaPlus /> Nouvel Acte
              </button>
            </div>

            {showServiceForm && (
              <div className="form-card">
                <div className="form-card-header">
                  <h3>{editingService ? 'Modifier l\'acte médical' : 'Nouvel acte médical'}</h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                      resetServiceForm();
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={editingService ? handleUpdateService : handleCreateService}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Code de l'acte *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={serviceFormData.service_code}
                        onChange={(e) => setServiceFormData({...serviceFormData, service_code: e.target.value.toUpperCase()})}
                        disabled={editingService !== null}
                        placeholder="Ex: CONSULTATION_GENERALE"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom de l'acte *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={serviceFormData.service_name}
                        onChange={(e) => setServiceFormData({...serviceFormData, service_name: e.target.value})}
                        placeholder="Ex: Consultation Générale"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Prix de base (FCFA) *</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min="0"
                        step="0.01"
                        value={serviceFormData.base_price}
                        onChange={(e) => setServiceFormData({...serviceFormData, base_price: e.target.value})}
                        placeholder="Ex: 5000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      value={serviceFormData.description}
                      onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
                      placeholder="Description de l'acte médical..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={serviceFormData.is_active}
                        onChange={(e) => setServiceFormData({...serviceFormData, is_active: e.target.checked})}
                      />
                      <span>Acte actif</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                        resetServiceForm();
                      }}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-success">
                      <FaSave /> Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Nom de l'acte</th>
                    <th>Prix de base</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalServices.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucun acte médical trouvé
                      </td>
                    </tr>
                  ) : (
                    medicalServices.map((service) => (
                      <tr key={service.id}>
                        <td><strong>{service.service_code}</strong></td>
                        <td>{service.service_name}</td>
                        <td>{parseFloat(service.base_price).toLocaleString()} FCFA</td>
                        <td>{service.description || '-'}</td>
                        <td>
                          <span className={`badge ${service.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {service.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditService(service)}
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Onglet Centre de Santé */}
        {activeTab === 'healthcenter' && (
          <div className="config-content">
            <div className="config-header">
              <h2>Informations du Centre de Santé</h2>
            </div>

            <div className="form-card">
              <form onSubmit={handleSaveHealthCenter}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom du Centre *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={healthCenterData.name}
                      onChange={(e) => setHealthCenterData({...healthCenterData, name: e.target.value})}
                      placeholder="Ex: Clinique Santé Plus"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      value={healthCenterData.contact}
                      onChange={(e) => setHealthCenterData({...healthCenterData, contact: e.target.value})}
                      placeholder="Ex: +237 6XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={healthCenterData.email}
                      onChange={(e) => setHealthCenterData({...healthCenterData, email: e.target.value})}
                      placeholder="Ex: contact@clinique.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={healthCenterData.city}
                      onChange={(e) => setHealthCenterData({...healthCenterData, city: e.target.value})}
                      placeholder="Ex: Douala"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse complète *</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    required
                    value={healthCenterData.address}
                    onChange={(e) => setHealthCenterData({...healthCenterData, address: e.target.value})}
                    placeholder="Ex: Rue 123, Quartier Bonanjo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL du Logo</label>
                  <input
                    type="url"
                    className="form-input"
                    value={healthCenterData.logo_url}
                    onChange={(e) => setHealthCenterData({...healthCenterData, logo_url: e.target.value})}
                    placeholder="https://exemple.com/logo.png"
                  />
                  <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                    URL complète du logo (optionnel)
                  </small>
                </div>

                {healthCenterData.logo_url && (
                  <div className="form-group">
                    <label className="form-label">Aperçu du Logo</label>
                    <div style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '4px', textAlign: 'center' }}>
                      <img
                        src={healthCenterData.logo_url}
                        alt="Logo du centre"
                        style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <p style={{ display: 'none', color: '#dc3545', margin: '0' }}>
                        Impossible de charger l'image
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    <FaSave /> Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Onglet Médecins/Praticiens */}
        {activeTab === 'doctors' && (
          <div className="config-content">
            <div className="config-header">
              <h2>Gestion des Médecins et Praticiens</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetDoctorForm();
                  setEditingDoctor(null);
                  setShowDoctorForm(true);
                }}
              >
                <FaPlus /> Nouveau Médecin/Praticien
              </button>
            </div>

            {showDoctorForm && (
              <div className="form-card">
                <div className="form-card-header">
                  <h3>{editingDoctor ? 'Modifier le médecin/praticien' : 'Nouveau médecin/praticien'}</h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setShowDoctorForm(false);
                      setEditingDoctor(null);
                      resetDoctorForm();
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Utilisateur associé</label>
                      <select
                        className="form-select"
                        value={doctorFormData.user_id}
                        onChange={(e) => setDoctorFormData({...doctorFormData, user_id: e.target.value})}
                      >
                        <option value="">Aucun (optionnel)</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.username})
                          </option>
                        ))}
                      </select>
                      <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                        Lier ce médecin à un compte utilisateur existant (optionnel)
                      </small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-input"
                        required={!doctorFormData.user_id}
                        value={doctorFormData.last_name}
                        onChange={(e) => setDoctorFormData({...doctorFormData, last_name: e.target.value})}
                        placeholder="Ex: Dupont"
                        disabled={doctorFormData.user_id !== ''}
                      />
                      <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                        {doctorFormData.user_id ? 'Le nom sera pris du compte utilisateur lié' : 'Requis si aucun utilisateur associé'}
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        className="form-input"
                        required={!doctorFormData.user_id}
                        value={doctorFormData.first_name}
                        onChange={(e) => setDoctorFormData({...doctorFormData, first_name: e.target.value})}
                        placeholder="Ex: Jean"
                        disabled={doctorFormData.user_id !== ''}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Spécialisation *</label>
                      <select
                        className="form-select"
                        required
                        value={doctorFormData.specialization}
                        onChange={(e) => setDoctorFormData({...doctorFormData, specialization: e.target.value})}
                      >
                        <option value="">Sélectionner une spécialisation...</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Numéro de licence</label>
                      <input
                        type="text"
                        className="form-input"
                        value={doctorFormData.license_number}
                        onChange={(e) => setDoctorFormData({...doctorFormData, license_number: e.target.value})}
                        placeholder="Ex: MD-12345"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Qualification</label>
                      <input
                        type="text"
                        className="form-input"
                        value={doctorFormData.qualification}
                        onChange={(e) => setDoctorFormData({...doctorFormData, qualification: e.target.value})}
                        placeholder="Ex: Docteur en Médecine, Spécialiste..."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Années d'expérience</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={doctorFormData.experience_years}
                        onChange={(e) => setDoctorFormData({...doctorFormData, experience_years: e.target.value})}
                        placeholder="Ex: 5"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tarif de consultation (FCFA)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        step="0.01"
                        value={doctorFormData.consultation_fee}
                        onChange={(e) => setDoctorFormData({...doctorFormData, consultation_fee: e.target.value})}
                        placeholder="Ex: 15000"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={doctorFormData.phone}
                        onChange={(e) => setDoctorFormData({...doctorFormData, phone: e.target.value})}
                        placeholder="+237 6XX XX XX XX"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={doctorFormData.email}
                        onChange={(e) => setDoctorFormData({...doctorFormData, email: e.target.value})}
                        placeholder="docteur@exemple.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={doctorFormData.is_active}
                        onChange={(e) => setDoctorFormData({...doctorFormData, is_active: e.target.checked})}
                      />
                      <span>Médecin actif</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDoctorForm(false);
                        setEditingDoctor(null);
                        resetDoctorForm();
                      }}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-success">
                      <FaSave /> Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Spécialisation</th>
                    <th>Licence</th>
                    <th>Expérience</th>
                    <th>Tarif</th>
                    <th>Contact</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucun médecin/praticien enregistré
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>
                          <strong>
                            {doctor.first_name && doctor.last_name
                              ? `${doctor.last_name} ${doctor.first_name}`
                              : doctor.email || 'N/A'}
                          </strong>
                        </td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.license_number || '-'}</td>
                        <td>{doctor.experience_years ? `${doctor.experience_years} ans` : '-'}</td>
                        <td>
                          {doctor.consultation_fee
                            ? `${parseFloat(doctor.consultation_fee).toLocaleString()} FCFA`
                            : '-'}
                        </td>
                        <td>
                          <div>{doctor.phone || '-'}</div>
                          <small style={{ color: '#6c757d' }}>{doctor.email || ''}</small>
                        </td>
                        <td>
                          <span className={`badge ${doctor.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {doctor.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ marginRight: '0.5rem' }}
                            onClick={() => handleEditDoctor(doctor)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteDoctor(doctor.id)}
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
        )}
      </div>
    </div>
  );
};

export default Configuration;
