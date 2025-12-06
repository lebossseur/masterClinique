import React, { useState } from 'react';
import './CashRegisterModal.css';

const OpenCashRegisterModal = ({ onClose, onSuccess }) => {
  const [openingAmount, setOpeningAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/cash-registers/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          opening_amount: parseFloat(openingAmount) || 0,
          notes: notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Erreur lors de l\'ouverture de la caisse');
      }
    } catch (error) {
      console.error('Open cash register error:', error);
      setError('Erreur lors de l\'ouverture de la caisse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cash-register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ouverture de caisse</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Montant d'ouverture (Fond de caisse)</label>
            <input
              type="number"
              className="form-input"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              placeholder="Montant en FCFA"
              step="0.01"
              min="0"
              disabled={loading}
            />
            <small className="form-text">Montant initial dans la caisse (optionnel)</small>
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
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Ouverture...' : 'Ouvrir la caisse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenCashRegisterModal;
