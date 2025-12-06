import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { insuranceService, healthCenterService } from '../services/api';

const InsuranceInvoicePrint = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [healthCenter, setHealthCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [invoiceRes, healthCenterRes] = await Promise.all([
        insuranceService.getInvoiceById(id),
        healthCenterService.get()
      ]);
      setInvoice(invoiceRes.data.data);
      setHealthCenter(healthCenterRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && invoice) {
      // Déclencher l'impression automatiquement après le chargement
      setTimeout(() => window.print(), 500);
    }
  }, [loading, invoice]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }

  if (!invoice) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Facture non trouvée</div>;
  }

  const totalAmount = invoice.items?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '20mm',
      background: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12pt',
      lineHeight: '1.4',
      color: '#000'
    }}>
      <style>{`
        @media print {
          body { margin: 0; }
          @page { size: A4; margin: 0; }
          .no-print { display: none !important; }
        }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #000; }
        th { background: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
      `}</style>

      {/* En-tête */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 'bold' }}>
              {healthCenter?.name || 'Centre de Santé'}
            </h1>
            {healthCenter?.address && <div style={{ marginTop: '0.5rem' }}>{healthCenter.address}</div>}
            {healthCenter?.phone && <div>Tél: {healthCenter.phone}</div>}
            {healthCenter?.email && <div>Email: {healthCenter.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '16pt', fontWeight: 'bold' }}>FACTURE D'ASSURANCE</h2>
            <div style={{ marginTop: '0.5rem', fontSize: '14pt', fontWeight: 'bold' }}>
              {invoice.invoice_number}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              Date: {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Informations compagnie d'assurance */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#f0f0f0', padding: '1rem', border: '1px solid #000' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>DESTINATAIRE:</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{invoice.company_name}</div>
          {invoice.company_code && <div>Code: {invoice.company_code}</div>}
          {invoice.address && <div style={{ marginTop: '0.5rem' }}>{invoice.address}</div>}
          {invoice.phone && <div>Tél: {invoice.phone}</div>}
          {invoice.email && <div>Email: {invoice.email}</div>}
        </div>
      </div>

      {/* Période */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', background: '#f0f0f0', padding: '0.5rem 1rem', border: '1px solid #000' }}>
          <strong>Période:</strong> {new Date(invoice.period_start).toLocaleDateString('fr-FR')} au {new Date(invoice.period_end).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Tableau des factures */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '1rem 0', fontSize: '14pt', fontWeight: 'bold' }}>DÉTAIL DES FACTURES PATIENTS</h3>
        <table>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>N°</th>
              <th style={{ width: '12%' }}>N° Facture</th>
              <th style={{ width: '10%' }}>Date</th>
              <th style={{ width: '20%' }}>Patient</th>
              <th style={{ width: '15%' }}>Matricule</th>
              <th className="text-center" style={{ width: '8%' }}>Taux</th>
              <th style={{ width: '15%' }}>Actes</th>
              <th className="text-right" style={{ width: '15%' }}>Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{item.patient_invoice_number}</td>
                  <td>{new Date(item.invoice_date).toLocaleDateString('fr-FR')}</td>
                  <td><strong>{item.patient_name}</strong></td>
                  <td style={{ fontFamily: 'monospace' }}>{item.insurance_policy_number || '-'}</td>
                  <td className="text-center">{item.coverage_percentage}%</td>
                  <td style={{ fontSize: '10pt' }}>{item.medical_services || '-'}</td>
                  <td className="text-right"><strong>{parseFloat(item.amount).toLocaleString()}</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">Aucune facture</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Récapitulatif */}
      <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '350px' }}>
            <table>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', background: '#f0f0f0' }}>Nombre de factures:</td>
                  <td className="text-right" style={{ background: '#f0f0f0' }}><strong>{invoice.total_invoices}</strong></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', fontSize: '14pt', background: '#e0e0e0' }}>MONTANT TOTAL:</td>
                  <td className="text-right" style={{ fontWeight: 'bold', fontSize: '14pt', background: '#e0e0e0' }}>
                    {totalAmount.toLocaleString()} FCFA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', marginTop: '3rem' }}>
              <strong>Signature et Cachet</strong><br/>
              {healthCenter?.name || 'Centre de Santé'}
            </div>
          </div>
          <div style={{ width: '45%', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', marginTop: '3rem' }}>
              <strong>Signature et Cachet</strong><br/>
              {invoice.company_name}
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div style={{
        position: 'absolute',
        bottom: '15mm',
        left: '20mm',
        right: '20mm',
        borderTop: '1px solid #ccc',
        paddingTop: '0.5rem',
        fontSize: '9pt',
        color: '#666',
        textAlign: 'center'
      }}>
        Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
      </div>
    </div>
  );
};

export default InsuranceInvoicePrint;
