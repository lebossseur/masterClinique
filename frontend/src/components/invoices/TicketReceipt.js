import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './TicketReceipt.css';

const TicketReceipt = ({ invoice, onClose }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Reçu-${invoice.invoice_number}`,
    onAfterPrint: () => {
      // Optionnel : fermer après impression
      // onClose();
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            Imprimer Reçu
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div ref={componentRef} className="ticket-receipt">
          <div className="ticket-header">
            <h2>MASTER CLINIQUE</h2>
            <p>Centre Médical d'Excellence</p>
            <p className="ticket-divider">================================</p>
          </div>

          <div className="ticket-info">
            <p><strong>REÇU N°:</strong> {invoice.invoice_number}</p>
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            <p><strong>Heure:</strong> {formatTime()}</p>
            <p className="ticket-divider">--------------------------------</p>
          </div>

          <div className="ticket-patient">
            <p><strong>Patient:</strong> {invoice.patient_name}</p>
            <p><strong>N° Patient:</strong> {invoice.patient_number}</p>
            {invoice.has_insurance && (
              <>
                <p><strong>Assurance:</strong> {invoice.insurance_company_name}</p>
                <p><strong>N° Assurance:</strong> {invoice.insurance_number}</p>
              </>
            )}
            <p className="ticket-divider">--------------------------------</p>
          </div>

          <div className="ticket-items">
            <p><strong>ACTE(S) MÉDICAL/MÉDICAUX</strong></p>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => (
                <div key={index} className="ticket-item">
                  <p className="item-name">{index + 1}. {item.description}</p>
                  <p className="item-price">{parseFloat(item.unit_price).toLocaleString()} FCFA</p>
                  {item.insurance_covered > 0 && (
                    <>
                      <p className="item-insurance">  Assurance: -{parseFloat(item.insurance_covered).toLocaleString()} FCFA</p>
                      <p className="item-patient">  Patient: {parseFloat(item.patient_pays).toLocaleString()} FCFA</p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '0.9em' }}>Aucun acte médical enregistré</p>
            )}
            <p className="ticket-divider">--------------------------------</p>
          </div>

          <div className="ticket-total">
            <p><strong>Total Base:</strong> <span>{parseFloat(invoice.total_amount).toLocaleString()} FCFA</span></p>
            {invoice.insurance_covered > 0 && (
              <>
                <p><strong>Pris en charge:</strong> <span>-{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA</span></p>
                <p className="ticket-divider">--------------------------------</p>
                <p className="total-due"><strong>À PAYER:</strong> <span>{parseFloat(invoice.patient_responsibility).toLocaleString()} FCFA</span></p>
              </>
            )}
            {!invoice.insurance_covered && (
              <p className="total-due"><strong>À PAYER:</strong> <span>{parseFloat(invoice.patient_responsibility).toLocaleString()} FCFA</span></p>
            )}
          </div>

          <div className="ticket-footer">
            <p className="ticket-divider">================================</p>
            <p>Merci de votre visite!</p>
            <p>Guérissez bien!</p>
            <p className="ticket-small">Service de qualité à votre écoute</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReceipt;
