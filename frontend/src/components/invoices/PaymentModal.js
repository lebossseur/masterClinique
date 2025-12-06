import React, { useState, useEffect } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ invoice, onClose, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const remaining = parseFloat(invoice.patient_responsibility) - totalPaid;

  useEffect(() => {
    // Récupérer le montant déjà payé
    const fetchTotalPaid = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success && data.data.invoice) {
          // Calculer le total payé à partir des paiements
          const paymentsResponse = await fetch(`http://localhost:5000/api/invoices/${invoice.id}/payments`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const paymentsData = await paymentsResponse.json();
          if (paymentsData.success) {
            const total = paymentsData.data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
            setTotalPaid(total);
          }
        }
      } catch (error) {
        console.error('Error fetching total paid:', error);
        setTotalPaid(0);
      }
    };

    fetchTotalPaid();
  }, [invoice.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const paymentAmount = parseFloat(amount) || 0;

    // Si c'est une facture à 0 FCFA (contrôle), permettre le paiement de 0
    const isControlInvoice = parseFloat(invoice.patient_responsibility) === 0;

    if (!isControlInvoice && paymentAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (paymentAmount > remaining) {
      setError(`Le montant ne peut pas dépasser ${remaining.toLocaleString()} FCFA`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/invoices/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          reference: reference || null,
          notes: notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        onPaymentSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Erreur lors de l\'enregistrement du paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (percentage) => {
    const quickAmount = (remaining * percentage / 100).toFixed(0);
    setAmount(quickAmount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Encaissement de la facture</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Numéro de facture:</span>
            <strong>{invoice.invoice_number}</strong>
          </div>
          <div className="summary-row">
            <span>Patient:</span>
            <strong>{invoice.patient_name}</strong>
          </div>
          <div className="summary-row">
            <span>Montant total:</span>
            <strong>{parseFloat(invoice.total_amount).toLocaleString()} FCFA</strong>
          </div>
          {invoice.insurance_covered > 0 && (
            <div className="summary-row" style={{ color: '#059669' }}>
              <span>Pris en charge (assurance):</span>
              <strong>-{parseFloat(invoice.insurance_covered).toLocaleString()} FCFA</strong>
            </div>
          )}
          <div className="summary-row highlight">
            <span>Montant à payer:</span>
            <strong>{parseFloat(invoice.patient_responsibility).toLocaleString()} FCFA</strong>
          </div>
          <div className="summary-row">
            <span>Déjà payé:</span>
            <strong>{totalPaid.toLocaleString()} FCFA</strong>
          </div>
          <div className="summary-row remaining">
            <span>Reste à payer:</span>
            <strong>{remaining.toLocaleString()} FCFA</strong>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Montant à encaisser *</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant en FCFA"
              step="0.01"
              min="0"
              max={remaining}
              required
              disabled={loading}
            />
            <div className="quick-amounts">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleQuickAmount(25)}
                disabled={loading}
              >
                25%
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleQuickAmount(50)}
                disabled={loading}
              >
                50%
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleQuickAmount(75)}
                disabled={loading}
              >
                75%
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={() => setAmount(remaining.toString())}
                disabled={loading}
              >
                Solde (100%)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Mode de paiement *</label>
            <select
              className="form-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              disabled={loading}
            >
              <option value="CASH">Espèces</option>
              <option value="CARD">Carte bancaire</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Virement bancaire</option>
              <option value="CHEQUE">Chèque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Référence</label>
            <input
              type="text"
              className="form-input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Numéro de transaction, chèque, etc."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles"
              rows="3"
              disabled={loading}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
