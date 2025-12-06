import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './A4Invoice.css';

const A4Invoice = ({ invoice, onClose }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Facture-${invoice.invoice_number}`,
    onAfterPrint: () => {
      // Optionnel
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            Imprimer Facture
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div ref={componentRef} className="a4-invoice">
          {/* En-tête */}
          <div className="invoice-header">
            <div className="clinic-info">
              <h1>MASTER CLINIQUE</h1>
              <p>Centre Médical d'Excellence</p>
              <p>Adresse: [Ville, Pays]</p>
              <p>Tél: +XXX XX XXX XXXX</p>
              <p>Email: contact@masterclinique.com</p>
            </div>
            <div className="invoice-details">
              <h2>FACTURE</h2>
              <p><strong>N°:</strong> {invoice.invoice_number}</p>
              <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
              <p><strong>N° Admission:</strong> {invoice.admission_number}</p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Informations Patient */}
          <div className="patient-section">
            <h3>INFORMATIONS PATIENT</h3>
            <div className="patient-details">
              <div className="patient-col">
                <p><strong>Nom:</strong> {invoice.patient_name}</p>
                <p><strong>N° Patient:</strong> {invoice.patient_number}</p>
                {invoice.phone && <p><strong>Téléphone:</strong> {invoice.phone}</p>}
              </div>
              {invoice.has_insurance && (
                <div className="patient-col">
                  <p><strong>Assurance:</strong> {invoice.insurance_company_name}</p>
                  <p><strong>N° Assurance:</strong> {invoice.insurance_number}</p>
                </div>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Tableau des actes */}
          <div className="services-section">
            <h3>DÉTAIL DES ACTES MÉDICAUX</h3>
            <table className="services-table">
              <thead>
                <tr>
                  <th className="col-description">Description</th>
                  <th className="col-qty">Qté</th>
                  <th className="col-price">Prix Unitaire</th>
                  <th className="col-total">Montant</th>
                  {invoice.has_insurance && (
                    <>
                      <th className="col-insurance">Pris en Charge</th>
                      <th className="col-patient">Part Patient</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{parseFloat(item.unit_price).toLocaleString()} FCFA</td>
                      <td className="text-right">{parseFloat(item.total_price).toLocaleString()} FCFA</td>
                      {invoice.has_insurance && (
                        <>
                          <td className="text-right">
                            {item.insurance_covered > 0 ? `${parseFloat(item.insurance_covered).toLocaleString()} FCFA` : '-'}
                          </td>
                          <td className="text-right">
                            <strong>{parseFloat(item.patient_pays || item.total_price).toLocaleString()} FCFA</strong>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={invoice.has_insurance ? "6" : "4"} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#6b7280' }}>
                      Aucun acte médical enregistré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="totals-section">
            <div className="totals-row">
              <span className="totals-label">Sous-total:</span>
              <span className="totals-value">{parseFloat(invoice.total_amount).toLocaleString()} FCFA</span>
            </div>
            {invoice.insurance_covered > 0 && (
              <>
                <div className="totals-row">
                  <span className="totals-label">Pris en charge (Assurance):</span>
                  <span className="totals-value insurance-color">
                    -{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="totals-divider"></div>
              </>
            )}
            <div className="totals-row total-due">
              <span className="totals-label">MONTANT À PAYER:</span>
              <span className="totals-value">{parseFloat(invoice.patient_responsibility).toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Pied de page */}
          <div className="invoice-footer">
            <div className="footer-note">
              <p><strong>Note:</strong> Cette facture est à régler au moment du paiement.</p>
              <p>Merci de votre confiance!</p>
            </div>
            <div className="footer-signature">
              <p>Signature et Cachet</p>
              <div className="signature-box"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A4Invoice;
