import React, { useState, useEffect } from 'react';
import './CashRegisterModal.css';

const CloseCashRegisterModal = ({ cashRegister, onClose, onSuccess }) => {
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerDetails, setRegisterDetails] = useState(null);

  useEffect(() => {
    fetchRegisterDetails();
  }, [cashRegister.id]);

  const fetchRegisterDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/cash-registers/${cashRegister.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRegisterDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching register details:', error);
    }
  };

  const expectedAmount = registerDetails
    ? parseFloat(registerDetails.register.opening_amount) +
      registerDetails.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    : 0;

  const difference = closingAmount ? parseFloat(closingAmount) - expectedAmount : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!closingAmount) {
      setError('Veuillez entrer le montant de clôture');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/cash-registers/${cashRegister.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          closing_amount: parseFloat(closingAmount),
          notes: notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Erreur lors de la fermeture de la caisse');
      }
    } catch (error) {
      console.error('Close cash register error:', error);
      setError('Erreur lors de la fermeture de la caisse');
    } finally {
      setLoading(false);
    }
  };

  if (!registerDetails) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cash-register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Clôture de caisse</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cash-summary">
          <h3>Résumé de la journée</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Ouverture:</span>
              <strong>{new Date(registerDetails.register.opening_date).toLocaleDateString()} à {registerDetails.register.opening_time}</strong>
            </div>
            <div className="summary-item">
              <span>Fond de caisse:</span>
              <strong>{parseFloat(registerDetails.register.opening_amount).toLocaleString()} FCFA</strong>
            </div>
            <div className="summary-item">
              <span>Nombre de paiements:</span>
              <strong>{registerDetails.payments.length}</strong>
            </div>
            <div className="summary-item">
              <span>Total encaissé:</span>
              <strong style={{ color: '#059669' }}>
                {registerDetails.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} FCFA
              </strong>
            </div>
          </div>

          <h4 style={{ marginTop: '1rem' }}>Répartition par mode de paiement</h4>
          <div className="payment-methods-summary">
            {registerDetails.paymentMethods.map((method) => (
              <div key={method.payment_method} className="payment-method-item">
                <span>{method.payment_method}:</span>
                <strong>{parseFloat(method.total).toLocaleString()} FCFA</strong>
              </div>
            ))}
          </div>

          <div className="expected-amount">
            <span>Montant attendu en caisse:</span>
            <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>
              {expectedAmount.toLocaleString()} FCFA
            </strong>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Montant réel en caisse *</label>
            <input
              type="number"
              className="form-input"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              placeholder="Montant compté en FCFA"
              step="0.01"
              min="0"
              required
              disabled={loading}
            />
            {closingAmount && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ color: difference === 0 ? '#059669' : difference > 0 ? '#2563eb' : '#dc2626' }}>
                  {difference === 0 && 'Caisse conforme'}
                  {difference > 0 && `Excédent: +${difference.toLocaleString()} FCFA`}
                  {difference < 0 && `Manquant: ${difference.toLocaleString()} FCFA`}
                </strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Notes de clôture</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Remarques, explications sur les écarts, etc."
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
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Fermeture...' : 'Fermer la caisse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseCashRegisterModal;
