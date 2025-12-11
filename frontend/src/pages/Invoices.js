import React, { useState, useEffect } from 'react';
import { invoiceService, admissionService } from '../services/api';
import { FaPlus, FaFileInvoice, FaUserClock, FaPrint, FaMoneyBillWave, FaCashRegister, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TicketReceipt from '../components/invoices/TicketReceipt';
import A4Invoice from '../components/invoices/A4Invoice';
import PaymentModal from '../components/invoices/PaymentModal';
import OpenCashRegisterModal from '../components/cashRegister/OpenCashRegisterModal';
import CloseCashRegisterModal from '../components/cashRegister/CloseCashRegisterModal';
import invoiceServiceAPI from '../services/invoice.service';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [waitingAdmissions, setWaitingAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceTypeModal, setShowInvoiceTypeModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [showA4, setShowA4] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const [activeCashRegister, setActiveCashRegister] = useState(null);
  const [showOpenCashRegister, setShowOpenCashRegister] = useState(false);
  const [showCloseCashRegister, setShowCloseCashRegister] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
    loadActiveCashRegister();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesResponse, admissionsResponse] = await Promise.all([
        invoiceService.getAll(),
        admissionService.getWaiting()
      ]);
      setInvoices(invoicesResponse.data.data);
      setWaitingAdmissions(admissionsResponse.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveCashRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cash-registers/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setActiveCashRegister(data.data);
      }
    } catch (error) {
      console.error('Error loading active cash register:', error);
    }
  };

  const handleOpenCashRegisterSuccess = (cashRegister) => {
    setActiveCashRegister(cashRegister);
    alert('Caisse ouverte avec succès!');
  };

  const handleCloseCashRegisterSuccess = (cashRegister) => {
    setActiveCashRegister(null);
    const diff = parseFloat(cashRegister.difference);
    let message = `Caisse fermée avec succès!\n\nMontant attendu: ${parseFloat(cashRegister.expected_amount).toLocaleString()} FCFA\nMontant réel: ${parseFloat(cashRegister.closing_amount).toLocaleString()} FCFA\n`;
    if (diff === 0) {
      message += '\nCaisse conforme ✓';
    } else if (diff > 0) {
      message += `\nExcédent: +${diff.toLocaleString()} FCFA`;
    } else {
      message += `\nManquant: ${diff.toLocaleString()} FCFA`;
    }
    alert(message);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'En attente', class: 'badge-warning' },
      'PARTIAL': { label: 'Partiel', class: 'badge-info' },
      'PAID': { label: 'Payé', class: 'badge-success' },
      'CONTROLE': { label: 'Contrôle', class: 'badge-success' },
      'CANCELLED': { label: 'Annulé', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getConsultationType = (type) => {
    const types = {
      'CONSULTATION_GENERALE': 'Consultation Générale',
      'CONSULTATION_PRENATALE': 'Consultation Prénatale',
      'CONSULTATION_GYNECOLOGIQUE': 'Consultation Gynécologique',
      'RADIOGRAPHIE': 'Radiographie',
      'EXAMENS_MEDICAUX': 'Examens Médicaux',
      'URGENCE': 'Urgence',
      'CHIRURGIE': 'Chirurgie',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  };

  const handleCreateInvoice = (admission) => {
    if (!activeCashRegister) {
      alert('Vous devez d\'abord ouvrir la caisse pour créer une facture.');
      return;
    }
    setSelectedAdmission(admission);
    setShowInvoiceTypeModal(true);
  };

  const createInvoiceWithType = async (type) => {
    try {
      const response = await invoiceServiceAPI.createInvoice(selectedAdmission.id, type);
      setCreatedInvoice(response.data);
      setShowInvoiceTypeModal(false);

      // Afficher le bon format
      if (type === 'TICKET') {
        setShowTicket(true);
      } else {
        setShowA4(true);
      }

      // Rafraîchir la liste
      loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture');
    }
  };

  const handlePayment = (invoice) => {
    if (!activeCashRegister) {
      alert('Vous devez d\'abord ouvrir la caisse pour encaisser un paiement.');
      return;
    }
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    alert(`Paiement enregistré avec succès!\nNuméro: ${paymentData.payment_number}\nStatut: ${paymentData.status}`);
    loadData();
    loadActiveCashRegister(); // Rafraîchir le montant encaissé
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      const response = await invoiceServiceAPI.getInvoiceById(invoice.id);
      setInvoiceToPrint(response.data);

      // Afficher le bon format selon le type
      if (invoice.invoice_type === 'TICKET') {
        setShowTicket(true);
      } else {
        setShowA4(true);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Erreur lors du chargement de la facture');
    }
  };

  if (loading) {
    return <div className="page-container">Chargement...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 0 }}>
            Caisse et Facturation
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: '1rem', fontWeight: 500 }}>
            Gestion des factures et paiements
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {activeCashRegister ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  fontWeight: 600,
                  color: '#065f46'
                }}>
                  <FaCashRegister style={{ fontSize: '1.5rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caisse Ouverte</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.875rem', color: '#047857' }}>Encaissé:</span>
                      <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#065f46' }}>
                        {parseFloat(activeCashRegister.total_collected || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowCloseCashRegister(true)}
                >
                  <FaLock /> Fermer la caisse
                </button>
              </>
            ) : (
              <button
                className="btn btn-success"
                onClick={() => setShowOpenCashRegister(true)}
              >
                <FaCashRegister /> Ouvrir la caisse
              </button>
            )}
          </div>
        </div>
      </div>

      {!activeCashRegister && (
        <div className="alert" style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <FaCashRegister style={{ fontSize: '2rem', color: '#d97706' }} />
          <div>
            <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>
              Caisse fermée
            </strong>
            <span style={{ color: '#78350f' }}>
              Vous devez ouvrir la caisse pour pouvoir enregistrer des paiements.
            </span>
          </div>
        </div>
      )}

      {/* Patients en attente de facturation */}
      {waitingAdmissions.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #f59e0b' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
            <h2 className="card-title" style={{ color: '#92400e' }}>
              <FaUserClock /> Patients en attente de facturation ({waitingAdmissions.length})
            </h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>N° Admission</th>
                  <th>Patient</th>
                  <th>N° Patient</th>
                  <th>Type de consultation</th>
                  <th>Montant Total</th>
                  <th>Assurance</th>
                  <th>À Payer</th>
                  <th>Heure</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingAdmissions.map((admission) => (
                  <tr key={admission.id} style={{ background: admission.is_control ? '#dcfce7' : '#fef3c7' }}>
                    <td>
                      <strong>{admission.admission_number}</strong>
                      {admission.is_control && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <span className="badge" style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '0.125rem 0.5rem' }}>
                            CONTRÔLE GRATUIT
                          </span>
                        </div>
                      )}
                    </td>
                    <td>{admission.patient_name}</td>
                    <td>{admission.patient_number}</td>
                    <td>
                      {admission.services && admission.services.length > 0 ? (
                        <div>
                          {admission.services.map((service, index) => (
                            <div key={index} style={{ marginBottom: index < admission.services.length - 1 ? '0.25rem' : '0', fontSize: '0.875rem' }}>
                              <span style={{ fontWeight: 600 }}>{service.service_name}</span>
                              {!admission.is_control && (
                                <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                                  ({parseFloat(service.base_price).toLocaleString()} FCFA)
                                </span>
                              )}
                              {admission.is_control && (
                                <span style={{ color: '#10b981', marginLeft: '0.5rem', fontWeight: 600 }}>
                                  (GRATUIT - Contrôle)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        getConsultationType(admission.consultation_type)
                      )}
                    </td>
                    <td><strong>{parseFloat(admission.base_price || 0).toLocaleString()} FCFA</strong></td>
                    <td>
                      {admission.has_insurance ? (
                        <div>
                          <span className="badge badge-success">Assuré - {parseFloat(admission.coverage_percentage || 0)}%</span>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {admission.insurance_company_name || 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                            Couvert: {parseFloat(admission.insurance_amount || 0).toLocaleString()} FCFA
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-secondary">Non assuré</span>
                      )}
                    </td>
                    <td>
                      {admission.is_control ? (
                        <div>
                          <strong style={{ fontSize: '1.2rem', color: '#10b981', fontWeight: 800 }}>
                            0 FCFA
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
                            Contrôle gratuit
                          </div>
                        </div>
                      ) : (
                        <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>
                          {parseFloat(admission.patient_amount || 0).toLocaleString()} FCFA
                        </strong>
                      )}
                    </td>
                    <td>{new Date(admission.created_at).toLocaleTimeString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCreateInvoice(admission)}
                        disabled={!activeCashRegister}
                        title={!activeCashRegister ? 'Ouvrez d\'abord la caisse' : 'Créer une facture'}
                      >
                        <FaPlus /> Créer Facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FaFileInvoice /> Toutes les factures
          </h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Montant Total</th>
                <th>Assurance</th>
                <th>À payer</th>
                <th>Payé</th>
                <th>Reste</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                (() => {
                  // Calculer les indices pour la pagination
                  const indexOfLastItem = currentPage * itemsPerPage;
                  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

                  return currentInvoices.map((invoice) => {
                    const totalPaid = parseFloat(invoice.paid_amount || 0);
                    const patientResponsibility = parseFloat(invoice.patient_responsibility || 0);
                    const remaining = patientResponsibility - totalPaid;

                    return (
                      <tr key={invoice.id}>
                        <td>{invoice.invoice_number}</td>
                        <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td>{invoice.patient_name}</td>
                        <td>{parseFloat(invoice.total_amount).toLocaleString()} FCFA</td>
                        <td>{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA</td>
                        <td>{patientResponsibility.toLocaleString()} FCFA</td>
                        <td>
                          <strong style={{ color: totalPaid > 0 ? '#059669' : '#6b7280' }}>
                            {totalPaid.toLocaleString()} FCFA
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: remaining > 0 ? '#dc2626' : '#059669' }}>
                            {remaining.toLocaleString()} FCFA
                          </strong>
                        </td>
                        <td>{getStatusBadge(invoice.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handlePrintInvoice(invoice)}
                              title="Imprimer"
                            >
                              <FaPrint />
                            </button>
                            {(invoice.status === 'PENDING' || invoice.status === 'PARTIAL') && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handlePayment(invoice)}
                                disabled={!activeCashRegister}
                                title={!activeCashRegister ? 'Ouvrez d\'abord la caisse' : 'Encaisser'}
                              >
                                <FaMoneyBillWave /> Encaisser
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {invoices.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Info sur les éléments affichés */}
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Affichage {Math.min((currentPage - 1) * itemsPerPage + 1, invoices.length)} à{' '}
              {Math.min(currentPage * itemsPerPage, invoices.length)} sur {invoices.length} factures
            </div>

            {/* Contrôles de pagination */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Sélecteur nombre par page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Par page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Boutons de navigation */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-secondary"
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaChevronLeft />
                </button>

                {/* Numéros de pages */}
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  {(() => {
                    const totalPages = Math.ceil(invoices.length / itemsPerPage);
                    const pages = [];
                    const maxPagesToShow = 5;

                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            background: i === currentPage ? '#3b82f6' : 'white',
                            color: i === currentPage ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: i === currentPage ? 600 : 400,
                            minWidth: '2rem'
                          }}
                        >
                          {i}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(invoices.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(invoices.length / itemsPerPage)}
                  className="btn btn-sm btn-secondary"
                  style={{
                    opacity: currentPage >= Math.ceil(invoices.length / itemsPerPage) ? 0.5 : 1,
                    cursor: currentPage >= Math.ceil(invoices.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de sélection du type de facture */}
      {showInvoiceTypeModal && selectedAdmission && (
        <div className="modal-overlay" onClick={() => setShowInvoiceTypeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Choisir le format de facture</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              <strong>Patient:</strong> {selectedAdmission.patient_name}<br />
              <strong>N° Admission:</strong> {selectedAdmission.admission_number}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => createInvoiceWithType('TICKET')}
                style={{ padding: '1rem', fontSize: '1rem' }}
              >
                <FaFileInvoice style={{ marginRight: '0.5rem' }} />
                Ticket de Caisse (80mm)
              </button>
              <button
                className="btn btn-success"
                onClick={() => createInvoiceWithType('A4')}
                style={{ padding: '1rem', fontSize: '1rem' }}
              >
                <FaFileInvoice style={{ marginRight: '0.5rem' }} />
                Facture A4 (Hospitalisation)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowInvoiceTypeModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affichage du ticket */}
      {showTicket && (createdInvoice || invoiceToPrint) && (
        <TicketReceipt
          invoice={{
            ...(createdInvoice ? createdInvoice.invoice : invoiceToPrint.invoice),
            items: createdInvoice ? createdInvoice.items : invoiceToPrint.items
          }}
          onClose={() => {
            setShowTicket(false);
            setCreatedInvoice(null);
            setInvoiceToPrint(null);
          }}
        />
      )}

      {/* Affichage de la facture A4 */}
      {showA4 && (createdInvoice || invoiceToPrint) && (
        <A4Invoice
          invoice={{
            ...(createdInvoice ? createdInvoice.invoice : invoiceToPrint.invoice),
            items: createdInvoice ? createdInvoice.items : invoiceToPrint.items
          }}
          onClose={() => {
            setShowA4(false);
            setCreatedInvoice(null);
            setInvoiceToPrint(null);
          }}
        />
      )}

      {/* Modal de paiement */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <PaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal d'ouverture de caisse */}
      {showOpenCashRegister && (
        <OpenCashRegisterModal
          onClose={() => setShowOpenCashRegister(false)}
          onSuccess={handleOpenCashRegisterSuccess}
        />
      )}

      {/* Modal de fermeture de caisse */}
      {showCloseCashRegister && activeCashRegister && (
        <CloseCashRegisterModal
          cashRegister={activeCashRegister}
          onClose={() => setShowCloseCashRegister(false)}
          onSuccess={handleCloseCashRegisterSuccess}
        />
      )}
    </div>
  );
};

export default Invoices;
