import React, { useState, useEffect } from 'react';
import { insuranceService } from '../services/api';
import { FaPlus, FaShieldAlt, FaTimes, FaEdit, FaChartBar, FaFileAlt, FaFileInvoice, FaEye } from 'react-icons/fa';

const Insurance = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('companies'); // 'companies', 'report' ou 'invoices'
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  // États pour les factures d'assurance
  const [insuranceInvoices, setInsuranceInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [generateForm, setGenerateForm] = useState({
    insurance_company_id: '',
    period_start: '',
    period_end: ''
  });
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await insuranceService.getAllCompanies();
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Error loading insurance companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (start = startDate, end = endDate) => {
    try {
      setLoadingReport(true);
      const params = new URLSearchParams();

      if (start) params.append('start_date', start);
      if (end) params.append('end_date', end);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await insuranceService.getReport(queryString);
      setReport(response.data.data);
    } catch (error) {
      console.error('Error loading insurance report:', error);
      alert('Erreur lors du chargement du rapport');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      code: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await insuranceService.createCompany(formData);
      alert('Compagnie d\'assurance créée avec succès !');
      setShowModal(false);
      loadCompanies(); // Recharger la liste
    } catch (error) {
      console.error('Error creating insurance company:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la compagnie';
      alert(errorMessage);
    }
  };

  // Fonctions pour les factures d'assurance
  const loadInsuranceInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await insuranceService.getAllInvoices();
      setInsuranceInvoices(response.data.data);
    } catch (error) {
      console.error('Error loading insurance invoices:', error);
      alert('Erreur lors du chargement des factures d\'assurance');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleOpenGenerateModal = () => {
    setGenerateForm({
      insurance_company_id: '',
      period_start: '',
      period_end: ''
    });
    setAvailableInvoices([]);
    setSelectedInvoiceIds([]);
    setShowGenerateModal(true);
  };

  const loadAvailableInvoices = async () => {
    if (!generateForm.insurance_company_id) {
      alert('Veuillez sélectionner une compagnie d\'assurance');
      return;
    }

    try {
      setLoadingAvailable(true);
      const response = await insuranceService.getAvailableInvoices({
        insurance_company_id: generateForm.insurance_company_id,
        period_start: generateForm.period_start,
        period_end: generateForm.period_end
      });
      setAvailableInvoices(response.data.data);
      setSelectedInvoiceIds([]);
    } catch (error) {
      console.error('Error loading available invoices:', error);
      alert('Erreur lors du chargement des factures disponibles');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleToggleInvoice = (invoiceId) => {
    setSelectedInvoiceIds(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoiceIds.length === availableInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(availableInvoices.map(inv => inv.id));
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    if (selectedInvoiceIds.length === 0) {
      alert('Veuillez sélectionner au moins une facture');
      return;
    }

    try {
      const response = await insuranceService.generateInvoice({
        ...generateForm,
        selected_invoice_ids: selectedInvoiceIds
      });
      alert(response.data.message);
      setShowGenerateModal(false);
      loadInsuranceInvoices();
    } catch (error) {
      console.error('Error generating invoice:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la génération de la facture';
      alert(errorMessage);
    }
  };

  const handleViewInvoiceDetails = async (invoiceId) => {
    try {
      const response = await insuranceService.getInvoiceById(invoiceId);
      setSelectedInvoice(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      alert('Erreur lors du chargement des détails de la facture');
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      await insuranceService.updateInvoiceStatus(invoiceId, { status: newStatus });
      alert('Statut mis à jour avec succès');
      loadInsuranceInvoices();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        handleViewInvoiceDetails(invoiceId);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': { label: 'Brouillon', color: '#6b7280' },
      'SENT': { label: 'Envoyée', color: '#3b82f6' },
      'PAID': { label: 'Payée', color: '#10b981' },
      'PARTIAL': { label: 'Partielle', color: '#f59e0b' }
    };

    const config = statusConfig[status] || statusConfig['DRAFT'];

    return (
      <span style={{
        background: config.color,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: 600
      }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <div className="page-container">Chargement...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 0 }}>
            Gestion des Assurances
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={`btn ${activeTab === 'companies' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('companies')}
            >
              <FaShieldAlt /> Compagnies
            </button>
            <button
              className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveTab('report');
                if (!report) loadReport();
              }}
            >
              <FaChartBar /> Rapport Actes & Coûts
            </button>
            <button
              className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveTab('invoices');
                if (insuranceInvoices.length === 0) loadInsuranceInvoices();
              }}
            >
              <FaFileInvoice /> Factures Assurance
            </button>
          </div>
          {activeTab === 'companies' && (
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <FaPlus /> Nouvelle Compagnie
            </button>
          )}
          {activeTab === 'invoices' && (
            <button className="btn btn-primary" onClick={handleOpenGenerateModal}>
              <FaPlus /> Générer Facture
            </button>
          )}
        </div>
      </div>

      {/* Onglet Compagnies */}
      {activeTab === 'companies' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <FaShieldAlt /> Compagnies d'assurance
            </h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      Aucune compagnie d'assurance trouvée
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id}>
                      <td><strong>{company.name}</strong></td>
                      <td>{company.code || '-'}</td>
                      <td>{company.contact_person || '-'}</td>
                      <td>{company.phone || '-'}</td>
                      <td>{company.email || '-'}</td>
                      <td>
                        <span className={`badge ${company.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {company.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet Rapport */}
      {activeTab === 'report' && (
        <div>
          {/* Filtres de période */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">Filtres de Période</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                  <label className="form-label">Date de début</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                  <label className="form-label">Date de fin</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => loadReport(startDate, endDate)}
                  disabled={loadingReport}
                >
                  <FaChartBar /> Générer Rapport
                </button>
                {(startDate || endDate) && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      loadReport('', '');
                    }}
                    disabled={loadingReport}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {loadingReport ? (
            <div className="card">
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Chargement du rapport...
              </div>
            </div>
          ) : report ? (
            <>
              {/* Statistiques globales */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h2 className="card-title">
                    <FaChartBar /> Statistiques Globales
                  </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Compagnies</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                        {report.global_stats.total_companies}
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Factures</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                        {report.global_stats.total_invoices}
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Montant Total</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                        {parseFloat(report.global_stats.total_amount).toLocaleString()} FCFA
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem' }}>Assurances Couvrent</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' }}>
                        {parseFloat(report.global_stats.total_insurance_covered).toLocaleString()} FCFA
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>Patients Paient</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7f1d1d' }}>
                        {parseFloat(report.global_stats.total_patient_responsibility).toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rapport par compagnie */}
              {report.companies.map((company) => (
                <div key={company.company_id} className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <h2 className="card-title" style={{ color: 'white', margin: 0 }}>
                        <FaShieldAlt /> {company.company_name} {company.company_code && `(${company.company_code})`}
                      </h2>
                      <div style={{ fontSize: '0.875rem' }}>
                        {company.total_invoices} facture(s)
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    {/* Résumé financier */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Montant Total</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                          {parseFloat(company.total_amount).toLocaleString()} FCFA
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', background: '#dbeafe', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                        <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>Assurance Couvre</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a8a' }}>
                          {parseFloat(company.total_insurance_covered).toLocaleString()} FCFA
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.25rem' }}>Patient Paie</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#7f1d1d' }}>
                          {parseFloat(company.total_patient_responsibility).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>

                    {/* Tableau des factures avec informations patients */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                        <FaFileAlt /> Factures et Patients
                      </h3>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Nom et Prénom</th>
                              <th>Matricule Assurance</th>
                              <th style={{ textAlign: 'center' }}>Taux Couverture</th>
                              <th>Actes Médicaux</th>
                              <th>N° Facture</th>
                              <th>Date</th>
                              <th style={{ textAlign: 'right' }}>Montant Total</th>
                              <th style={{ textAlign: 'right' }}>Assurance</th>
                              <th style={{ textAlign: 'right' }}>Patient</th>
                            </tr>
                          </thead>
                          <tbody>
                            {company.invoices.length === 0 ? (
                              <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>
                                  Aucune facture
                                </td>
                              </tr>
                            ) : (
                              company.invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                  <td>
                                    <strong>{invoice.first_name} {invoice.last_name}</strong>
                                  </td>
                                  <td>
                                    <span style={{
                                      background: '#f3f4f6',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px',
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem'
                                    }}>
                                      {invoice.insurance_policy_number || '-'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                      background: '#dbeafe',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '12px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                      color: '#1e40af'
                                    }}>
                                      {invoice.coverage_percentage}%
                                    </span>
                                  </td>
                                  <td>
                                    {invoice.medical_services && invoice.medical_services.length > 0 ? (
                                      <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.25rem',
                                        maxWidth: '250px'
                                      }}>
                                        {invoice.medical_services.map((service, idx) => (
                                          <span
                                            key={idx}
                                            style={{
                                              background: '#e0f2fe',
                                              color: '#0369a1',
                                              padding: '0.125rem 0.5rem',
                                              borderRadius: '4px',
                                              fontSize: '0.75rem',
                                              fontWeight: 500,
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {service}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>-</span>
                                    )}
                                  </td>
                                  <td>{invoice.invoice_number}</td>
                                  <td>{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    <strong>{parseFloat(invoice.total_amount).toLocaleString()} FCFA</strong>
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#1e3a8a' }}>
                                    <strong>{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA</strong>
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#7f1d1d' }}>
                                    <strong>{parseFloat(invoice.patient_responsibility).toLocaleString()} FCFA</strong>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tableau des actes médicaux */}
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                        <FaFileAlt /> Détail des Actes Médicaux
                      </h3>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Acte Médical</th>
                              <th>Code</th>
                              <th style={{ textAlign: 'center' }}>Nombre</th>
                              <th style={{ textAlign: 'right' }}>Prix Total</th>
                              <th style={{ textAlign: 'right' }}>Assurance</th>
                              <th style={{ textAlign: 'right' }}>Patient</th>
                            </tr>
                          </thead>
                          <tbody>
                            {company.services_summary.length === 0 ? (
                              <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
                                  Aucun acte médical
                                </td>
                              </tr>
                            ) : (
                              company.services_summary.map((service, index) => (
                                <tr key={index}>
                                  <td><strong>{service.service_name}</strong></td>
                                  <td>{service.service_code}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                      background: '#dbeafe',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '12px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600
                                    }}>
                                      {service.count}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <strong>{parseFloat(service.total_base_price).toLocaleString()} FCFA</strong>
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#1e3a8a' }}>
                                    <strong>{parseFloat(service.total_insurance_covered).toLocaleString()} FCFA</strong>
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#7f1d1d' }}>
                                    <strong>{parseFloat(service.total_patient_pays).toLocaleString()} FCFA</strong>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="card">
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Cliquez sur "Rapport Actes & Coûts" pour générer le rapport
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet Factures Assurance */}
      {activeTab === 'invoices' && (
        <div>
          {/* Liste des factures */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <FaFileInvoice /> Factures d'Assurance
              </h2>
            </div>

            {loadingInvoices ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Chargement...
              </div>
            ) : (
              <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Compagnie</th>
                    <th>Période</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Nb Factures</th>
                    <th style={{ textAlign: 'right' }}>Montant Total</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucune facture d'assurance
                      </td>
                    </tr>
                  ) : (
                    insuranceInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td><strong>{invoice.invoice_number}</strong></td>
                        <td>
                          <div>
                            <strong>{invoice.company_name}</strong>
                            {invoice.company_code && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{invoice.company_code}</div>}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem' }}>
                            <div>{new Date(invoice.period_start).toLocaleDateString('fr-FR')}</div>
                            <div>{new Date(invoice.period_end).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </td>
                        <td>{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: '#dbeafe',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            {invoice.total_invoices}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>{parseFloat(invoice.total_amount).toLocaleString()} FCFA</strong>
                        </td>
                        <td>{getStatusBadge(invoice.status)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleViewInvoiceDetails(invoice.id)}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            <FaEye /> Détails
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaShieldAlt /> Nouvelle Compagnie d'Assurance
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom de la Compagnie *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: NSIA Assurance"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: NSIA"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Personne de Contact</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="Nom du contact"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: +225 XX XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@assurance.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Adresse complète de la compagnie"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaPlus /> Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal génération facture d'assurance */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '1200px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaFileInvoice /> Générer Facture d'Assurance
              </h2>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice}>
              <div className="modal-body">
                {/* Sélection compagnie et période */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Compagnie d'Assurance *</label>
                    <select
                      className="form-input"
                      required
                      value={generateForm.insurance_company_id}
                      onChange={(e) => {
                        setGenerateForm({ ...generateForm, insurance_company_id: e.target.value });
                        setAvailableInvoices([]);
                        setSelectedInvoiceIds([]);
                      }}
                    >
                      <option value="">Sélectionner une compagnie</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} {company.code && `(${company.code})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date de début</label>
                      <input
                        type="date"
                        className="form-input"
                        value={generateForm.period_start}
                        onChange={(e) => {
                          setGenerateForm({ ...generateForm, period_start: e.target.value });
                          setAvailableInvoices([]);
                          setSelectedInvoiceIds([]);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date de fin</label>
                      <input
                        type="date"
                        className="form-input"
                        value={generateForm.period_end}
                        onChange={(e) => {
                          setGenerateForm({ ...generateForm, period_end: e.target.value });
                          setAvailableInvoices([]);
                          setSelectedInvoiceIds([]);
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={loadAvailableInvoices}
                    disabled={loadingAvailable || !generateForm.insurance_company_id}
                  >
                    {loadingAvailable ? 'Chargement...' : 'Charger les factures disponibles'}
                  </button>
                </div>

                {/* Liste des factures disponibles */}
                {availableInvoices.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                        Factures disponibles ({availableInvoices.length})
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {selectedInvoiceIds.length} sélectionné(s)
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={handleSelectAll}
                        >
                          {selectedInvoiceIds.length === availableInvoices.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                        </button>
                      </div>
                    </div>

                    <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>
                              <input
                                type="checkbox"
                                checked={selectedInvoiceIds.length === availableInvoices.length && availableInvoices.length > 0}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th>N° Facture</th>
                            <th>Date</th>
                            <th>Patient</th>
                            <th>Matricule</th>
                            <th style={{ textAlign: 'center' }}>Taux</th>
                            <th>Actes</th>
                            <th style={{ textAlign: 'right' }}>Montant Assuré</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableInvoices.map((invoice) => (
                            <tr
                              key={invoice.id}
                              style={{
                                background: selectedInvoiceIds.includes(invoice.id) ? '#dbeafe' : 'transparent',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleToggleInvoice(invoice.id)}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedInvoiceIds.includes(invoice.id)}
                                  onChange={() => handleToggleInvoice(invoice.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td>{invoice.invoice_number}</td>
                              <td>{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</td>
                              <td><strong>{invoice.patient_name}</strong></td>
                              <td>
                                <span style={{
                                  background: '#f3f4f6',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem'
                                }}>
                                  {invoice.insurance_policy_number || '-'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{
                                  background: '#dbeafe',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}>
                                  {invoice.coverage_percentage}%
                                </span>
                              </td>
                              <td style={{ fontSize: '0.875rem', maxWidth: '200px' }}>
                                {invoice.medical_services || '-'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <strong>{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA</strong>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f9fafb', fontWeight: 600 }}>
                            <td colSpan="7" style={{ textAlign: 'right' }}>Total sélectionné :</td>
                            <td style={{ textAlign: 'right' }}>
                              <strong>
                                {availableInvoices
                                  .filter(inv => selectedInvoiceIds.includes(inv.id))
                                  .reduce((sum, inv) => sum + parseFloat(inv.insurance_covered), 0)
                                  .toLocaleString()} FCFA
                              </strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {availableInvoices.length === 0 && !loadingAvailable && generateForm.insurance_company_id && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    color: '#92400e',
                    textAlign: 'center'
                  }}>
                    <strong>Aucune facture disponible</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      Cliquez sur "Charger les factures disponibles" pour voir les factures qui ne sont pas encore incluses dans une facture d'assurance.
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={selectedInvoiceIds.length === 0}
                >
                  <FaPlus /> Générer ({selectedInvoiceIds.length} facture{selectedInvoiceIds.length > 1 ? 's' : ''})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détails facture d'assurance */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '1200px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaFileInvoice /> Détails Facture {selectedInvoice.invoice_number}
              </h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {/* En-tête de la facture */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Compagnie</div>
                  <div style={{ fontWeight: 600 }}>{selectedInvoice.company_name}</div>
                  {selectedInvoice.company_code && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedInvoice.company_code}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Période</div>
                  <div>{new Date(selectedInvoice.period_start).toLocaleDateString('fr-FR')} - {new Date(selectedInvoice.period_end).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Date Facture</div>
                  <div>{new Date(selectedInvoice.invoice_date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Statut</div>
                  <div>{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              {/* Actions sur le statut */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  Changer le statut :
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'DRAFT')}
                    disabled={selectedInvoice.status === 'DRAFT'}
                  >
                    Brouillon
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'SENT')}
                    disabled={selectedInvoice.status === 'SENT'}
                  >
                    Envoyée
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#f59e0b', color: 'white' }}
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'PARTIAL')}
                    disabled={selectedInvoice.status === 'PARTIAL'}
                  >
                    Partielle
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#10b981', color: 'white' }}
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'PAID')}
                    disabled={selectedInvoice.status === 'PAID'}
                  >
                    Payée
                  </button>
                </div>
              </div>

              {/* Récapitulatif */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem' }}>Nombre de Factures</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' }}>{selectedInvoice.total_invoices}</div>
                </div>
                <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '0.5rem' }}>Montant Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}>
                    {parseFloat(selectedInvoice.total_amount).toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              {/* Liste des factures patients */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Détail des Factures Patients
                </h3>
                <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>N° Facture</th>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Matricule</th>
                        <th style={{ textAlign: 'center' }}>Taux</th>
                        <th>Actes</th>
                        <th style={{ textAlign: 'right' }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.patient_invoice_number}</td>
                            <td>{new Date(item.invoice_date).toLocaleDateString('fr-FR')}</td>
                            <td><strong>{item.patient_name}</strong></td>
                            <td>
                              <span style={{
                                background: '#f3f4f6',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                              }}>
                                {item.insurance_policy_number || '-'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                background: '#dbeafe',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {item.coverage_percentage}%
                              </span>
                            </td>
                            <td style={{ fontSize: '0.875rem', maxWidth: '200px' }}>
                              {item.medical_services || '-'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <strong>{parseFloat(item.amount).toLocaleString()} FCFA</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                            Aucun détail disponible
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.open(`/insurance-invoice-print/${selectedInvoice.id}`, '_blank')}
              >
                <FaFileAlt /> Imprimer Facture (A4)
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;
