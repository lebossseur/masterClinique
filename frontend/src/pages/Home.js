import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService, admissionService, pricingService, insuranceService, medicalRecordService } from '../services/api';
import {
  FaUserPlus, FaSearch, FaStethoscope, FaShieldAlt,
  FaClipboardList, FaCashRegister, FaArrowRight, FaCheck,
  FaThermometerHalf, FaWeight, FaHeartbeat, FaTint, FaUser, FaTrash, FaPlus
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rediriger les médecins vers la page Médecine
  useEffect(() => {
    if (user && user.role_name === 'MEDECIN') {
      navigate('/medicine');
    }
  }, [user, navigate]);

  // État du workflow
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  // Données du nouveau patient
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'M',
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

  // Constantes médicales
  const [vitals, setVitals] = useState({
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    weight: '',
    height: '',
    blood_sugar: '',
    notes: ''
  });

  // Informations de consultation
  const [consultationInfo, setConsultationInfo] = useState({
    has_insurance: false,
    patient_insurance_id: '',
    insurance_company_id: '',
    insurance_number: '',
    coverage_rate: '',
    consultation_type: '',
    reason: ''
  });

  // États pour les actes médicaux multiples
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentService, setCurrentService] = useState('');
  const [currentServicePrice, setCurrentServicePrice] = useState('');
  const [allServices, setAllServices] = useState([]);

  // États pour les tarifs et assurances
  const [prices, setPrices] = useState({});
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [patientInsurances, setPatientInsurances] = useState([]);
  const [pricingDetails, setPricingDetails] = useState(null);
  const [totalPricing, setTotalPricing] = useState({
    base_total: 0,
    insurance_covered: 0,
    patient_pays: 0
  });

  // États pour les modals
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [showAddInsuranceModal, setShowAddInsuranceModal] = useState(false);
  const [newInsurance, setNewInsurance] = useState({
    insurance_company_id: '',
    policy_number: '',
    coverage_percentage: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });

  const consultationTypes = [
    { value: 'CONSULTATION_GENERALE', label: 'Consultation Générale' },
    { value: 'CONSULTATION_PRENATALE', label: 'Consultation Prénatale' },
    { value: 'CONSULTATION_GYNECOLOGIQUE', label: 'Consultation Gynécologique' },
    { value: 'RADIOGRAPHIE', label: 'Radiographie' },
    { value: 'EXAMENS_MEDICAUX', label: 'Examens Médicaux' },
    { value: 'URGENCE', label: 'Urgence' },
    { value: 'CHIRURGIE', label: 'Chirurgie' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Charger les prix et les compagnies d'assurance
  useEffect(() => {
    loadPricesAndInsurance();
  }, []);

  // Charger les assurances du patient quand on arrive à l'étape 3
  useEffect(() => {
    if (currentStep === 3 && selectedPatient) {
      loadPatientInsurances();
    }
  }, [currentStep, selectedPatient]);

  const loadPricesAndInsurance = async () => {
    try {
      const [pricesResponse, insuranceResponse] = await Promise.all([
        pricingService.getAllPrices(),
        pricingService.getAllInsuranceCompanies()
      ]);

      // Convertir le tableau de prix en objet pour accès facile
      const pricesMap = {};
      const services = pricesResponse.data.data || [];
      services.forEach(price => {
        pricesMap[price.service_code] = price.base_price;
      });

      setPrices(pricesMap);
      setAllServices(services);
      setInsuranceCompanies(insuranceResponse.data.data);
    } catch (error) {
      console.error('Error loading prices and insurance:', error);
    }
  };

  const loadPatientInsurances = async () => {
    try {
      const response = await insuranceService.getPatientInsurance(selectedPatient.id);
      setPatientInsurances(response.data.data);
    } catch (error) {
      console.error('Error loading patient insurances:', error);
      setPatientInsurances([]);
    }
  };

  // Ajouter un acte médical à la liste
  const handleAddService = async () => {
    if (!currentService) {
      alert('Veuillez sélectionner un acte médical');
      return;
    }

    // Vérifier si l'acte n'est pas déjà dans la liste
    if (selectedServices.find(s => s.service_code === currentService)) {
      alert('Cet acte est déjà dans la liste');
      return;
    }

    try {
      const serviceData = allServices.find(s => s.service_code === currentService);

      // Utiliser le prix personnalisé ou le prix de base
      const basePrice = currentServicePrice ? parseFloat(currentServicePrice) : parseFloat(serviceData.base_price);

      // Calculer les montants assurance et patient
      const coverageRate = consultationInfo.coverage_rate || 0;
      const insuranceCovered = (basePrice * coverageRate) / 100;
      const patientPays = basePrice - insuranceCovered;

      const newService = {
        service_code: currentService,
        service_name: serviceData.service_name,
        base_price: basePrice,
        insurance_covered: insuranceCovered,
        patient_pays: patientPays
      };

      console.log('New service:', newService);

      setSelectedServices([...selectedServices, newService]);
      setCurrentService('');
      setCurrentServicePrice('');

      // Recalculer le total
      calculateTotal([...selectedServices, newService]);
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Erreur lors de l\'ajout de l\'acte médical');
    }
  };

  // Supprimer un acte de la liste
  const handleRemoveService = (serviceCode) => {
    const updatedServices = selectedServices.filter(s => s.service_code !== serviceCode);
    setSelectedServices(updatedServices);
    calculateTotal(updatedServices);
  };

  // Calculer le total de tous les actes
  const calculateTotal = (services) => {
    const total = services.reduce((acc, service) => {
      return {
        base_total: acc.base_total + (parseFloat(service.base_price) || 0),
        insurance_covered: acc.insurance_covered + (parseFloat(service.insurance_covered) || 0),
        patient_pays: acc.patient_pays + (parseFloat(service.patient_pays) || 0)
      };
    }, { base_total: 0, insurance_covered: 0, patient_pays: 0 });

    setTotalPricing(total);
  };

  // Recalculer tous les actes si la couverture change
  const recalculateAllServices = async (coverageRate) => {
    if (selectedServices.length === 0) return;

    try {
      const updatedServices = await Promise.all(
        selectedServices.map(async (service) => {
          const response = await pricingService.calculatePricing({
            service_code: service.service_code,
            coverage_rate: coverageRate || 0
          });

          const pricingData = response.data.data;
          return {
            ...service,
            insurance_covered: pricingData.insurance_covered || pricingData.insurance_amount || 0,
            // IMPORTANT: Ne pas utiliser || car 0 est valide (assurance 100%)
            patient_pays: pricingData.patient_pays !== undefined && pricingData.patient_pays !== null
              ? pricingData.patient_pays
              : (pricingData.patient_amount !== undefined && pricingData.patient_amount !== null
                  ? pricingData.patient_amount
                  : service.base_price)
          };
        })
      );

      setSelectedServices(updatedServices);
      calculateTotal(updatedServices);
    } catch (error) {
      console.error('Error recalculating services:', error);
    }
  };

  // Ajouter une nouvelle assurance pour le patient
  const handleAddInsurance = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Aucun patient sélectionné');
      return;
    }

    try {
      const insuranceData = {
        ...newInsurance,
        patient_id: selectedPatient.id
      };

      await insuranceService.addPatientInsurance(insuranceData);
      alert('Assurance ajoutée avec succès !');

      // Recharger les assurances du patient
      loadPatientInsurances();

      // Réinitialiser le formulaire
      setNewInsurance({
        insurance_company_id: '',
        policy_number: '',
        coverage_percentage: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
      });

      setShowAddInsuranceModal(false);
    } catch (error) {
      console.error('Error adding insurance:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout de l\'assurance';
      alert(errorMessage);
    }
  };

  // Ouvrir les modals côte à côte
  const openModals = () => {
    setShowPatientDetailsModal(true);
    setShowAddInsuranceModal(true);
  };

  // Fermer les modals
  const closeModals = () => {
    setShowPatientDetailsModal(false);
    setShowAddInsuranceModal(false);
  };

  // Calculer le prix quand le type de consultation ou le taux de couverture change
  const calculatePricing = async (consultationType, coverageRate) => {
    if (!consultationType) {
      setPricingDetails(null);
      return;
    }

    try {
      const response = await pricingService.calculatePricing({
        service_code: consultationType,
        coverage_rate: coverageRate || 0
      });

      setPricingDetails(response.data.data);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setPricingDetails(null);
    }
  };

  // Gérer la sélection d'une assurance enregistrée du patient
  const handleSelectPatientInsurance = async (patientInsurance) => {
    if (!patientInsurance) {
      // Reset insurance info
      setConsultationInfo({
        ...consultationInfo,
        patient_insurance_id: '',
        insurance_company_id: '',
        insurance_number: '',
        coverage_rate: ''
      });
      // Recalculer tous les actes sans assurance
      recalculateAllServices(0);
      if (consultationInfo.consultation_type) {
        calculatePricing(consultationInfo.consultation_type, 0);
      }
      return;
    }

    // Si un type de consultation est déjà sélectionné, récupérer le taux de couverture spécifique
    let coverageRate = patientInsurance.coverage_percentage; // Taux par défaut

    if (consultationInfo.consultation_type) {
      try {
        const response = await pricingService.getCoverageRate(
          patientInsurance.insurance_company_id,
          consultationInfo.consultation_type
        );
        coverageRate = response.data.data.coverage_rate;
      } catch (error) {
        console.error('Error getting coverage rate:', error);
        // En cas d'erreur, utiliser le taux par défaut du patient
      }
    }

    // Auto-populate insurance info from patient's registered insurance
    setConsultationInfo({
      ...consultationInfo,
      patient_insurance_id: patientInsurance.id,
      insurance_company_id: patientInsurance.insurance_company_id,
      insurance_number: patientInsurance.policy_number,
      coverage_rate: coverageRate
    });

    // Recalculer tous les actes avec la nouvelle couverture
    recalculateAllServices(coverageRate);

    // Recalculate pricing with the specific coverage rate
    if (consultationInfo.consultation_type) {
      calculatePricing(consultationInfo.consultation_type, coverageRate);
    }
  };

  // Recherche de patient
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await patientService.search(searchQuery);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // Sélection d'un patient
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchQuery('');
    setCurrentStep(2);
  };

  // Enregistrement d'un nouveau patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();

    try {
      const response = await patientService.create(newPatient);
      console.log('Patient created successfully:', response.data);
      setSelectedPatient(response.data.data);
      setShowNewPatientForm(false);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating patient:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création du patient';
      alert(errorMessage);
    }
  };

  // Enregistrement des constantes
  const handleSaveVitals = () => {
    // Ici, vous pouvez envoyer les constantes au backend
    console.log('Vitals saved:', vitals);
    setCurrentStep(3);
  };

  // Enregistrement des informations de consultation
  const handleSaveConsultation = async () => {
    if (selectedServices.length === 0) {
      alert('Veuillez ajouter au moins un acte médical');
      return;
    }

    console.log('Consultation info saved:', consultationInfo);
    console.log('Selected services:', selectedServices);
    console.log('Total pricing:', totalPricing);
    setCurrentStep(4);
  };

  // Affectation à la caisse
  const handleAssignToCashier = async () => {
    try {
      // Utiliser le premier acte comme type de consultation principal
      const mainConsultationType = selectedServices.length > 0 ? selectedServices[0].service_code : '';

      const admissionData = {
        patient_id: selectedPatient.id,
        vitals: vitals,
        has_insurance: consultationInfo.has_insurance,
        insurance_company_id: consultationInfo.has_insurance ? consultationInfo.insurance_company_id : null,
        insurance_number: consultationInfo.has_insurance ? consultationInfo.insurance_number : null,
        consultation_type: mainConsultationType,
        consultation_reason: consultationInfo.reason,
        // Ajouter tous les actes médicaux
        services: selectedServices.map(service => ({
          service_code: service.service_code,
          service_name: service.service_name,
          base_price: service.base_price,
          insurance_covered: service.insurance_covered || 0,
          // IMPORTANT: Ne pas utiliser || car 0 est valide (assurance 100%)
          patient_pays: service.patient_pays !== undefined && service.patient_pays !== null ? service.patient_pays : service.base_price
        })),
        // Ajouter le total
        total_base: totalPricing.base_total,
        total_insurance_covered: totalPricing.insurance_covered,
        total_patient_pays: totalPricing.patient_pays
      };

      console.log('Admission data:', admissionData);

      // Créer l'admission
      const response = await admissionService.create(admissionData);
      console.log('Admission created:', response.data);

      // Créer la consultation médicale en attente
      let consultationCreated = false;
      try {
        const consultationData = {
          consultation_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 'EN_ATTENTE',
          chief_complaint: consultationInfo.reason || 'Consultation',
          symptoms: vitals.notes || '',
          diagnosis: '',
          treatment_plan: '',
          prescriptions: '',
          notes: `Constantes: T=${vitals.temperature}°C, TA=${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}, FC=${vitals.heart_rate}, Poids=${vitals.weight}kg, Glycémie=${vitals.blood_sugar}`,
          follow_up_date: null
        };
        console.log('=== CREATING CONSULTATION ===');
        console.log('Patient ID:', selectedPatient.id);
        console.log('Consultation data:', consultationData);

        const consultResponse = await medicalRecordService.createConsultation(selectedPatient.id, consultationData);
        console.log('✅ Medical consultation created successfully:', consultResponse.data);
        consultationCreated = true;
      } catch (consultError) {
        console.error('❌ Error creating consultation:', consultError);
        console.error('Error response:', consultError.response?.data);
        console.error('Error message:', consultError.message);
        // Afficher l'erreur mais ne pas bloquer le workflow
        const errorMsg = consultError.response?.data?.message || consultError.message || 'Erreur inconnue';
        console.warn('⚠️ La consultation médicale n\'a pas été créée:', errorMsg);
      }

      const message = consultationCreated
        ? `Patient affecté à la caisse avec succès !\nNuméro d'admission: ${response.data.data.admission_number}\n\n✅ Une consultation médicale a été créée et attend le médecin.`
        : `Patient affecté à la caisse avec succès !\nNuméro d'admission: ${response.data.data.admission_number}\n\n⚠️ ATTENTION: La consultation médicale n'a pas pu être créée. Vérifiez les logs de la console.`;
      alert(message);

      // Réinitialiser le workflow
      resetWorkflow();
    } catch (error) {
      console.error('Error creating admission:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'affectation à la caisse';
      alert(errorMessage);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
    setNewPatient({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'M',
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
    setVitals({
      temperature: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      weight: '',
      height: '',
      blood_sugar: '',
      notes: ''
    });
    setConsultationInfo({
      has_insurance: false,
      patient_insurance_id: '',
      insurance_company_id: '',
      insurance_number: '',
      coverage_rate: '',
      consultation_type: '',
      reason: ''
    });
    setPricingDetails(null);
    setPatientInsurances([]);
    setSelectedServices([]);
    setCurrentService('');
    setTotalPricing({ base_total: 0, insurance_covered: 0, patient_pays: 0 });
  };

  const steps = [
    { number: 1, label: 'Rechercher/Enregistrer Patient', icon: FaUser },
    { number: 2, label: 'Constantes Médicales', icon: FaStethoscope },
    { number: 3, label: 'Infos Consultation', icon: FaClipboardList },
    { number: 4, label: 'Affectation Caisse', icon: FaCashRegister }
  ];

  return (
    <>
      {/* Modals côte à côte */}
      {(showPatientDetailsModal || showAddInsuranceModal) && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modals-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Détails Patient */}
            {showPatientDetailsModal && selectedPatient && (
              <div className="modal modal-patient-details">
                <div className="modal-header">
                  <h3><FaUser /> Détails du Patient</h3>
                  <button className="modal-close" onClick={closeModals}>&times;</button>
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
                              <span className={insurance.is_active ? 'status-active' : 'status-inactive'}>
                                {insurance.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">Aucune assurance enregistrée</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Ajout d'Assurance */}
            {showAddInsuranceModal && selectedPatient && (
              <div className="modal modal-add-insurance">
                <div className="modal-header">
                  <h3><FaShieldAlt /> Ajouter une Assurance</h3>
                  <button className="modal-close" onClick={closeModals}>&times;</button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddInsurance}>
                    <div className="form-group">
                      <label className="form-label">Compagnie d'Assurance *</label>
                      <select
                        className="form-select"
                        required
                        value={newInsurance.insurance_company_id}
                        onChange={(e) => setNewInsurance({...newInsurance, insurance_company_id: e.target.value})}
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
                        value={newInsurance.policy_number}
                        onChange={(e) => setNewInsurance({...newInsurance, policy_number: e.target.value})}
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
                        value={newInsurance.coverage_percentage}
                        onChange={(e) => setNewInsurance({...newInsurance, coverage_percentage: e.target.value})}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Date de Début *</label>
                        <input
                          type="date"
                          className="form-input"
                          required
                          value={newInsurance.start_date}
                          onChange={(e) => setNewInsurance({...newInsurance, start_date: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date de Fin</label>
                        <input
                          type="date"
                          className="form-input"
                          value={newInsurance.end_date}
                          onChange={(e) => setNewInsurance({...newInsurance, end_date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newInsurance.is_active}
                          onChange={(e) => setNewInsurance({...newInsurance, is_active: e.target.checked})}
                        />
                        <span>Assurance active</span>
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={closeModals}>
                        Annuler
                      </button>
                      <button type="submit" className="btn btn-success">
                        <FaCheck /> Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="page-container">
      <div className="home-welcome">
        <h1>Accueil - Prise en Charge Patient</h1>
        <p>Bienvenue, {user.first_name} {user.last_name}</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="workflow-steps">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`workflow-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {currentStep > step.number ? <FaCheck /> : <step.icon />}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {/* Étape 1: Rechercher/Enregistrer Patient */}
      {currentStep === 1 && (
        <div className="workflow-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Étape 1: Identification du Patient</h2>
            </div>

            {!showNewPatientForm ? (
              <>
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher un patient (nom, prénom, numéro)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-primary" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h3>Résultats de la recherche</h3>
                    <div className="patients-list">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="patient-item clickable"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className="patient-avatar">
                            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                          </div>
                          <div className="patient-info">
                            <div className="patient-name">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="patient-meta">
                              <span className="patient-number">{patient.patient_number}</span>
                              <span className="patient-separator">•</span>
                              <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <FaArrowRight />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="or-divider">
                  <span>OU</span>
                </div>

                <button
                  className="btn btn-success btn-block"
                  onClick={() => setShowNewPatientForm(true)}
                >
                  <FaUserPlus /> Enregistrer un Nouveau Patient
                </button>
              </>
            ) : (
              <form onSubmit={handleCreatePatient} className="patient-form">
                <h3>Nouveau Patient</h3>

                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e40af', fontSize: '1rem' }}>Informations Personnelles</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newPatient.last_name}
                      onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newPatient.first_name}
                      onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
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
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre *</label>
                    <select
                      className="form-select"
                      required
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type de Pièce d'Identité</label>
                    <select
                      className="form-select"
                      value={newPatient.type_piece_identite}
                      onChange={(e) => setNewPatient({...newPatient, type_piece_identite: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="CNI">Carte Nationale d'Identité</option>
                      <option value="PASSPORT">Passeport</option>
                      <option value="PERMIS_CONDUIRE">Permis de Conduire</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de Pièce</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newPatient.numero_piece_identite}
                      onChange={(e) => setNewPatient({...newPatient, numero_piece_identite: e.target.value})}
                      placeholder="Ex: 123456789"
                    />
                  </div>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#1e40af', fontSize: '1rem' }}>Contact</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      placeholder="Ex: +237 6XX XX XX XX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
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
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                      placeholder="Ex: Quartier Bastos"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newPatient.city}
                      onChange={(e) => setNewPatient({...newPatient, city: e.target.value})}
                      placeholder="Ex: Yaoundé"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNewPatientForm(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    <FaCheck /> Enregistrer et Continuer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Étape 2: Constantes Médicales */}
      {currentStep === 2 && selectedPatient && (
        <div className="workflow-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Étape 2: Constantes Médicales</h2>
              <div className="patient-badge">
                {selectedPatient.first_name} {selectedPatient.last_name} - {selectedPatient.patient_number}
              </div>
            </div>

            <div className="vitals-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaThermometerHalf /> Température (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="37.0"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <FaWeight /> Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="70.0"
                    value={vitals.weight}
                    onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <FaWeight /> Taille (cm)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="170"
                    value={vitals.height}
                    onChange={(e) => setVitals({...vitals, height: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaHeartbeat /> Tension Artérielle - Systolique (mmHg)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="120"
                    value={vitals.blood_pressure_systolic}
                    onChange={(e) => setVitals({...vitals, blood_pressure_systolic: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <FaHeartbeat /> Tension Artérielle - Diastolique (mmHg)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="80"
                    value={vitals.blood_pressure_diastolic}
                    onChange={(e) => setVitals({...vitals, blood_pressure_diastolic: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <FaHeartbeat /> Fréquence Cardiaque (bpm)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="75"
                    value={vitals.heart_rate}
                    onChange={(e) => setVitals({...vitals, heart_rate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaTint /> Glycémie (g/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="1.0"
                    value={vitals.blood_sugar}
                    onChange={(e) => setVitals({...vitals, blood_sugar: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Observations</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Observations particulières..."
                  value={vitals.notes}
                  onChange={(e) => setVitals({...vitals, notes: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveVitals}
                >
                  Continuer <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Informations de Consultation */}
      {currentStep === 3 && selectedPatient && (
        <div className="workflow-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Étape 3: Informations de Consultation</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="patient-badge">
                  {selectedPatient.first_name} {selectedPatient.last_name} - {selectedPatient.patient_number}
                </div>
                <button
                  type="button"
                  className="btn btn-info btn-sm"
                  onClick={openModals}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <FaUser /> Détails Patient & Assurances
                </button>
              </div>
            </div>

            <div className="consultation-form">
              <div className="form-group">
                <label className="form-label">
                  <FaShieldAlt /> Le patient est-il assuré ?
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="insurance"
                      checked={consultationInfo.has_insurance === true}
                      onChange={() => setConsultationInfo({...consultationInfo, has_insurance: true})}
                    />
                    <span>Oui</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="insurance"
                      checked={consultationInfo.has_insurance === false}
                      onChange={() => setConsultationInfo({...consultationInfo, has_insurance: false})}
                    />
                    <span>Non</span>
                  </label>
                </div>
              </div>

              {consultationInfo.has_insurance && (
                <>
                  {/* Sélection des assurances enregistrées du patient */}
                  <div className="form-group">
                    <label className="form-label">
                      <FaShieldAlt /> Sélectionner l'Assurance du Patient
                    </label>
                    {patientInsurances.length > 0 ? (
                      <>
                        <select
                          className="form-select"
                          value={consultationInfo.patient_insurance_id || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Ne pas utiliser d'assurance
                              setConsultationInfo({
                                ...consultationInfo,
                                patient_insurance_id: '',
                                insurance_company_id: '',
                                insurance_number: '',
                                coverage_rate: 0
                              });
                              // Recalculer le prix sans assurance
                              if (consultationInfo.consultation_type) {
                                calculatePricing(consultationInfo.consultation_type, 0);
                              }
                            } else {
                              const insurance = patientInsurances.find(ins => ins.id === parseInt(value));
                              if (insurance) {
                                handleSelectPatientInsurance(insurance);
                              }
                            }
                          }}
                        >
                          <option value="">Ne pas utiliser d'assurance</option>
                          {patientInsurances.map((insurance) => (
                            <option key={insurance.id} value={insurance.id}>
                              {insurance.company_name} - Police: {insurance.policy_number} - Couverture: {insurance.coverage_percentage}%
                            </option>
                          ))}
                        </select>
                        <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                          Vous pouvez choisir de ne pas utiliser d'assurance pour cette consultation
                        </small>
                      </>
                    ) : (
                      <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#92400e' }}>
                        <strong>Aucune assurance enregistrée.</strong> Veuillez ajouter une assurance au patient via les détails du patient.
                      </div>
                    )}
                  </div>

                  {consultationInfo.patient_insurance_id && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Compagnie d'Assurance</label>
                        <input
                          type="text"
                          className="form-input"
                          disabled
                          value={insuranceCompanies.find(c => c.id === parseInt(consultationInfo.insurance_company_id))?.name || ''}
                          style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Numéro de Police</label>
                          <input
                            type="text"
                            className="form-input"
                            disabled
                            value={consultationInfo.insurance_number}
                            style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Taux de Couverture (%)</label>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ex: 80"
                            value={consultationInfo.coverage_rate}
                            onChange={(e) => {
                              const rate = parseFloat(e.target.value) || 0;
                              setConsultationInfo({...consultationInfo, coverage_rate: rate});
                              if (consultationInfo.consultation_type) {
                                calculatePricing(consultationInfo.consultation_type, rate);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginTop: '-0.5rem' }}>
                        Vous pouvez modifier le taux de couverture pour cette consultation si nécessaire
                      </small>
                    </>
                  )}
                </>
              )}

              {/* Section Actes Médicaux Multiples */}
              <div className="form-group">
                <label className="form-label">
                  <FaClipboardList /> Actes Médicaux *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select
                    className="form-select"
                    value={currentService}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      setCurrentService(selectedCode);
                      // Pré-remplir le prix avec le prix de base
                      if (selectedCode) {
                        const service = allServices.find(s => s.service_code === selectedCode);
                        setCurrentServicePrice(service ? service.base_price : '');
                      } else {
                        setCurrentServicePrice('');
                      }
                    }}
                    style={{ flex: 2 }}
                  >
                    <option value="">Sélectionner un acte médical...</option>
                    {allServices.filter(s => s.is_active).map((service) => (
                      <option key={service.service_code} value={service.service_code}>
                        {service.service_name} - {parseFloat(service.base_price).toLocaleString()} FCFA
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Prix"
                    value={currentServicePrice}
                    onChange={(e) => setCurrentServicePrice(e.target.value)}
                    disabled={!currentService}
                    style={{ flex: 1 }}
                    min="0"
                    step="1"
                  />
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleAddService}
                    disabled={!currentService || !currentServicePrice}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FaPlus /> Ajouter
                  </button>
                </div>
                <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginTop: '-0.75rem', marginBottom: '0.5rem' }}>
                  Vous pouvez modifier le prix avant d'ajouter l'acte
                </small>

                {/* Liste des actes ajoutés */}
                {selectedServices.length > 0 && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                      Actes sélectionnés ({selectedServices.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedServices.map((service, index) => (
                        <div
                          key={index}
                          style={{
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                              {service.service_name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', gap: '1rem' }}>
                              <span>Prix: {parseFloat(service.base_price).toLocaleString()} FCFA</span>
                              {parseFloat(service.insurance_covered) > 0 && (
                                <>
                                  <span style={{ color: '#059669' }}>
                                    Assurance: {parseFloat(service.insurance_covered).toLocaleString()} FCFA
                                  </span>
                                  <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                    Patient: {parseFloat(service.patient_pays).toLocaleString()} FCFA
                                  </span>
                                </>
                              )}
                              {parseFloat(service.insurance_covered) === 0 && (
                                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                  Patient: {parseFloat(service.patient_pays).toLocaleString()} FCFA
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveService(service.service_code)}
                            style={{ marginLeft: '1rem' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Total Base</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e40af' }}>
                            {totalPricing.base_total.toLocaleString()} FCFA
                          </div>
                        </div>
                        {totalPricing.insurance_covered > 0 && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Pris en Charge</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>
                              {totalPricing.insurance_covered.toLocaleString()} FCFA
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>À Payer</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
                            {totalPricing.patient_pays.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Motif de la Visite</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Décrivez le motif de la consultation..."
                  value={consultationInfo.reason}
                  onChange={(e) => setConsultationInfo({...consultationInfo, reason: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveConsultation}
                  disabled={selectedServices.length === 0}
                >
                  Continuer <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 4: Affectation à la Caisse */}
      {currentStep === 4 && selectedPatient && (
        <div className="workflow-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Étape 4: Récapitulatif et Affectation</h2>
            </div>

            <div className="summary-content">
              <div className="summary-section">
                <h3><FaUser /> Informations Patient</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Nom Complet:</span>
                    <span className="summary-value">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Numéro:</span>
                    <span className="summary-value">{selectedPatient.patient_number}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date de Naissance:</span>
                    <span className="summary-value">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Téléphone:</span>
                    <span className="summary-value">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3><FaStethoscope /> Constantes Médicales</h3>
                <div className="summary-grid">
                  {vitals.temperature && (
                    <div className="summary-item">
                      <span className="summary-label">Température:</span>
                      <span className="summary-value">{vitals.temperature}°C</span>
                    </div>
                  )}
                  {vitals.weight && (
                    <div className="summary-item">
                      <span className="summary-label">Poids:</span>
                      <span className="summary-value">{vitals.weight} kg</span>
                    </div>
                  )}
                  {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
                    <div className="summary-item">
                      <span className="summary-label">Tension:</span>
                      <span className="summary-value">{vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic} mmHg</span>
                    </div>
                  )}
                  {vitals.heart_rate && (
                    <div className="summary-item">
                      <span className="summary-label">Fréquence Cardiaque:</span>
                      <span className="summary-value">{vitals.heart_rate} bpm</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="summary-section">
                <h3><FaClipboardList /> Consultation</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Assurance:</span>
                    <span className="summary-value">
                      {consultationInfo.has_insurance ? (
                        <>Oui - {consultationInfo.insurance_company}</>
                      ) : (
                        'Non'
                      )}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Type:</span>
                    <span className="summary-value">
                      {consultationTypes.find(t => t.value === consultationInfo.consultation_type)?.label}
                    </span>
                  </div>
                  {consultationInfo.reason && (
                    <div className="summary-item full-width">
                      <span className="summary-label">Motif:</span>
                      <span className="summary-value">{consultationInfo.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="alert alert-info">
                <FaCashRegister />
                <span>Le patient sera affecté à la caisse pour la facturation</span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(3)}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-large"
                  onClick={handleAssignToCashier}
                >
                  <FaCashRegister /> Affecter à la Caisse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Home;
