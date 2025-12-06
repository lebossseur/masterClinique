# Système de Facturation - État d'Implémentation

## ✅ Complété

### Backend
1. **Table invoices** mise à jour avec `admission_id` et `invoice_type` (TICKET/A4)
2. **Contrôleur invoice.controller.js** :
   - createInvoice() : Accepte le type de facture en paramètre
   - getAllInvoices()
   - getInvoiceById()
3. **Routes /api/invoices** : POST, GET, GET/:id
4. **Table admission_services** : Stocke tous les actes par admission

### Frontend
1. **Service invoice.service.js** : API calls avec type de facture
2. **Composant TicketReceipt.js** : Format thermique 80mm
3. **Composant A4Invoice.js** : Format A4 professionnel
4. **CSS TicketReceipt.css** : Styles optimisés pour imprimante thermique
5. **Modification Home.js** : Permet de modifier le prix des actes

## 🔧 À Finaliser

### 1. CSS Facture A4
Créer le fichier `frontend/src/components/invoices/A4Invoice.css` avec le contenu suivant :

```css
/* Modal */
.invoice-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
}

.invoice-modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 95%;
  max-height: 95vh;
  overflow-y: auto;
}

.invoice-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

/* Facture A4 */
.a4-invoice {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  padding: 20mm;
  font-family: 'Arial', sans-serif;
  font-size: 11pt;
  color: #000;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.clinic-info h1 {
  font-size: 24pt;
  margin: 0;
  color: #2563eb;
}

.clinic-info p {
  margin: 0.25rem 0;
  font-size: 10pt;
}

.invoice-details {
  text-align: right;
}

.invoice-details h2 {
  font-size: 20pt;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.invoice-details p {
  margin: 0.25rem 0;
}

.divider {
  border-top: 2px solid #2563eb;
  margin: 1.5rem 0;
}

.patient-section h3 {
  font-size: 14pt;
  margin-bottom: 1rem;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.patient-details {
  display: flex;
  gap: 3rem;
}

.patient-col {
  flex: 1;
}

.patient-col p {
  margin: 0.5rem 0;
}

.services-section h3 {
  font-size: 14pt;
  margin-bottom: 1rem;
  color: #1f2937;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.services-table th {
  background-color: #2563eb;
  color: white;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
}

.services-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.services-table tbody tr:hover {
  background-color: #f9fafb;
}

.col-description { width: 35%; }
.col-qty { width: 8%; text-align: center; }
.col-price { width: 15%; }
.col-total { width: 15%; }
.col-insurance { width: 15%; }
.col-patient { width: 12%; }

.text-center { text-align: center; }
.text-right { text-align: right; }

.totals-section {
  margin-top: 2rem;
  margin-left: auto;
  width: 50%;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.totals-label {
  font-weight: 600;
}

.totals-value {
  font-weight: 600;
}

.insurance-color {
  color: #059669;
}

.totals-divider {
  border-top: 1px solid #e5e7eb;
  margin: 0.5rem 0;
}

.total-due {
  font-size: 14pt;
  background-color: #f3f4f6;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
}

.invoice-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.footer-note {
  flex: 1;
}

.footer-note p {
  margin: 0.5rem 0;
}

.footer-signature {
  text-align: center;
}

.signature-box {
  width: 150px;
  height: 80px;
  border: 1px solid #000;
  margin-top: 0.5rem;
}

/* Impression */
@media print {
  .invoice-modal-overlay {
    position: static;
    background: none;
  }

  .invoice-modal-content {
    box-shadow: none;
    padding: 0;
    max-height: none;
  }

  .invoice-actions {
    display: none;
  }

  .a4-invoice {
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 15mm;
    box-shadow: none;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
```

### 2. Installation de react-to-print
Exécuter dans le dossier frontend :
```bash
npm install react-to-print --save
```

### 3. Mise à jour de Invoices.js
Modifier le fichier `frontend/src/pages/Invoices.js` :

Ajouter les imports :
```javascript
import invoiceService from '../services/invoice.service';
import TicketReceipt from '../components/invoices/TicketReceipt';
import A4Invoice from '../components/invoices/A4Invoice';
```

Ajouter les états :
```javascript
const [showInvoiceTypeModal, setShowInvoiceTypeModal] = useState(false);
const [selectedAdmission, setSelectedAdmission] = useState(null);
const [createdInvoice, setCreatedInvoice] = useState(null);
const [showTicket, setShowTicket] = useState(false);
const [showA4, setShowA4] = useState(false);
```

Remplacer la fonction handleCreateInvoice :
```javascript
const handleCreateInvoice = (admission) => {
  setSelectedAdmission(admission);
  setShowInvoiceTypeModal(true);
};

const createInvoiceWithType = async (type) => {
  try {
    const response = await invoiceService.createInvoice(selectedAdmission.id, type);
    setCreatedInvoice(response.data);
    setShowInvoiceTypeModal(false);

    // Afficher le bon format
    if (type === 'TICKET') {
      setShowTicket(true);
    } else {
      setShowA4(true);
    }

    // Rafraîchir la liste
    fetchWaitingAdmissions();
  } catch (error) {
    console.error('Error creating invoice:', error);
    alert('Erreur lors de la création de la facture');
  }
};
```

Ajouter le modal de sélection avant la fermeture du JSX :
```javascript
{showInvoiceTypeModal && (
  <div className="modal-overlay" onClick={() => setShowInvoiceTypeModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Choisir le format de facture</h3>
      <p>Patient: {selectedAdmission?.patient_name}</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          className="btn btn-primary"
          onClick={() => createInvoiceWithType('TICKET')}
        >
          Ticket de Caisse (80mm)
        </button>
        <button
          className="btn btn-success"
          onClick={() => createInvoiceWithType('A4')}
        >
          Facture A4
        </button>
      </div>
      <button
        className="btn btn-secondary"
        onClick={() => setShowInvoiceTypeModal(false)}
        style={{ marginTop: '1rem' }}
      >
        Annuler
      </button>
    </div>
  </div>
)}

{showTicket && createdInvoice && (
  <TicketReceipt
    invoice={createdInvoice.invoice}
    onClose={() => setShowTicket(false)}
  />
)}

{showA4 && createdInvoice && (
  <A4Invoice
    invoice={createdInvoice.invoice}
    onClose={() => setShowA4(false)}
  />
)}
```

### 4. Redémarrer le backend
Tuer le serveur actuel et relancer :
```bash
cd backend && npm start
```

## Utilisation

1. Dans "Patients en Attente", cliquer sur "Créer Facture"
2. Choisir le format :
   - **Ticket de Caisse** : Pour consultations rapides (1 ou plusieurs actes)
   - **Facture A4** : Pour hospitalisations/factures détaillées
3. La facture s'affiche avec bouton d'impression
4. L'admission passe au statut "BILLED"

## Format des Documents

### Ticket (80mm)
- Format imprimante thermique
- Style texte monospace
- Compact et clair
- Parfait pour consultations

### Facture A4 (210mm)
- Format professionnel
- Tableau détaillé des actes
- En-tête avec logo
- Espace pour signature et cachet
- Idéal pour hospitalisations et assurances
