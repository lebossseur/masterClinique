import React, { useState, useEffect } from 'react';
import { accountingService, invoiceService, pharmacyService } from '../services/api';
import {
  FaChartLine,
  FaMoneyBillWave,
  FaCashRegister,
  FaPills,
  FaShoppingCart,
  FaPlus,
  FaEye,
  FaFileInvoice,
  FaCalendarAlt,
  FaTimes,
  FaPrint,
  FaClipboardList
} from 'react-icons/fa';
import './Home.css';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState('caisse');
  const [loading, setLoading] = useState(false);

  // État pour les sessions de caisse
  const [cashSessions, setCashSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState([]);
  const [cashDateRange, setCashDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // État pour la pharmacie
  const [pharmacyStats, setPharmacyStats] = useState(null);
  const [pharmacySales, setPharmacySales] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // État pour les achats/dépenses
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'FOURNITURES',
    amount: '',
    payment_method: 'CASH',
    description: ''
  });
  const [expenseDateRange, setExpenseDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // État pour la pagination des factures
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // État pour le récapitulatif financier
  const [financialSummary, setFinancialSummary] = useState({
    income: [],
    expenses: [],
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
  });
  const [summaryDateRange, setSummaryDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (activeTab === 'caisse') {
      loadCashSessions();
    } else if (activeTab === 'pharmacie') {
      loadPharmacyData();
    } else if (activeTab === 'achats') {
      loadExpenses();
    } else if (activeTab === 'recap') {
      loadFinancialSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fonctions pour les sessions de caisse
  const loadCashSessions = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll();
      const invoices = response.data.data || [];

      // Filtrer les factures par plage de dates
      const startDate = new Date(cashDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(cashDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      // Grouper les factures par date
      const sessionsByDate = filteredInvoices.reduce((acc, invoice) => {
        const date = new Date(invoice.created_at).toLocaleDateString('fr-FR');
        if (!acc[date]) {
          acc[date] = {
            date,
            invoices: [],
            totalAmount: 0,
            totalPaid: 0,
            totalRemaining: 0,
            count: 0,
            // Statistiques par type de facture
            withInsurance: { count: 0, amount: 0, paid: 0, remaining: 0 },
            withoutInsurance: { count: 0, amount: 0, paid: 0, remaining: 0 },
            // Statistiques par acte
            byService: {}
          };
        }

        // Utiliser patient_responsibility (ce que le patient doit payer) au lieu de total_amount
        const totalAmount = parseFloat(invoice.patient_responsibility || invoice.total_amount || 0);
        const paidAmount = parseFloat(invoice.paid_amount || 0);
        const remaining = totalAmount - paidAmount;

        acc[date].invoices.push(invoice);
        acc[date].totalAmount += totalAmount;
        acc[date].totalPaid += paidAmount;
        acc[date].totalRemaining += remaining;
        acc[date].count++;

        // Grouper par type de facture (avec ou sans assurance)
        const hasInsurance = invoice.has_insurance || invoice.insurance_company_id || parseFloat(invoice.insurance_covered || 0) > 0;
        if (hasInsurance) {
          acc[date].withInsurance.count++;
          acc[date].withInsurance.amount += totalAmount;
          acc[date].withInsurance.paid += paidAmount;
          acc[date].withInsurance.remaining += remaining;
        } else {
          acc[date].withoutInsurance.count++;
          acc[date].withoutInsurance.amount += totalAmount;
          acc[date].withoutInsurance.paid += paidAmount;
          acc[date].withoutInsurance.remaining += remaining;
        }

        // Grouper par acte (service)
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items.forEach(item => {
            const serviceName = item.service_name || item.description || 'Service non spécifié';
            if (!acc[date].byService[serviceName]) {
              acc[date].byService[serviceName] = {
                name: serviceName,
                count: 0,
                amount: 0,
                paid: 0,
                remaining: 0
              };
            }

            // Utiliser total_price de l'item pour le montant
            const itemAmount = parseFloat(item.total_price || item.unit_price || 0);

            // Calculer la proportion payée pour cet item
            // proportion = montant_item / montant_total_facture
            // montant_payé_item = proportion * montant_payé_facture
            const itemPaid = totalAmount > 0 ? (itemAmount / totalAmount) * paidAmount : 0;
            const itemRemaining = itemAmount - itemPaid;

            acc[date].byService[serviceName].count++;
            acc[date].byService[serviceName].amount += itemAmount;
            acc[date].byService[serviceName].paid += itemPaid;
            acc[date].byService[serviceName].remaining += itemRemaining;
          });
        }

        return acc;
      }, {});

      setCashSessions(Object.values(sessionsByDate).sort((a, b) => {
        // Trier par date décroissante
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des sessions de caisse:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCashDateRangeChange = (e) => {
    setCashDateRange({
      ...cashDateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyCashDateFilter = () => {
    loadCashSessions();
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setSessionDetails(session.invoices);
  };

  const closeSessionDetails = () => {
    setSelectedSession(null);
    setSessionDetails([]);
    setCurrentPage(1); // Réinitialiser la page
  };

  // Fonctions de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = sessionDetails.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessionDetails.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fonctions pour la pharmacie
  const loadPharmacyData = async () => {
    setLoading(true);
    try {
      const salesResponse = await pharmacyService.getSalesReport(dateRange.startDate, dateRange.endDate);

      const reportData = salesResponse.data.data || {};
      const sales = reportData.sales || [];

      // Transformer les ventes pour avoir une ligne par item vendu
      const salesItems = [];
      sales.forEach(sale => {
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach(item => {
            salesItems.push({
              id: `${sale.id}-${item.id}`,
              sale_date: sale.exit_date,
              sale_number: sale.exit_number,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_amount: item.total_price,
              cost: 0
            });
          });
        }
      });

      setPharmacySales(salesItems);

      // Utiliser les statistiques du backend
      const stats = reportData.statistics || {};
      setPharmacyStats({
        totalRevenue: stats.total_amount || 0,
        totalCost: 0,
        profit: stats.total_amount || 0,
        salesCount: stats.total_sales || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données pharmacie:', error);
      setPharmacySales([]);
      setPharmacyStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyDateFilter = () => {
    loadPharmacyData();
  };

  // Fonctions pour les achats/dépenses
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await accountingService.getAllExpenses();
      const allExpenses = response.data.data || [];

      // Filtrer les dépenses par plage de dates
      const startDate = new Date(expenseDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(expenseDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      const filteredExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.transaction_date || expense.expense_date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseDateRangeChange = (e) => {
    setExpenseDateRange({
      ...expenseDateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyExpenseDateFilter = () => {
    loadExpenses();
  };

  const handleExpenseFormChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value
    });
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountingService.createExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        transaction_date: new Date().toISOString()
      });

      setShowExpenseModal(false);
      setExpenseForm({
        category: 'FOURNITURES',
        amount: '',
        payment_method: 'CASH',
        description: ''
      });
      loadExpenses();
      alert('Dépense enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la dépense:', error);
      alert('Erreur lors de l\'enregistrement de la dépense');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour le récapitulatif financier
  const loadFinancialSummary = async () => {
    setLoading(true);
    try {
      const startDate = new Date(summaryDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(summaryDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      // Charger les factures (entrées)
      const invoicesResponse = await invoiceService.getAll();
      const allInvoices = invoicesResponse.data.data || [];
      const filteredInvoices = allInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      // Charger les ventes pharmacie (entrées)
      const pharmacyResponse = await pharmacyService.getSalesReport(
        summaryDateRange.startDate,
        summaryDateRange.endDate
      );
      const pharmacySales = pharmacyResponse.data.data?.sales || [];

      // Charger les dépenses (sorties)
      const expensesResponse = await accountingService.getAllExpenses();
      const allExpenses = expensesResponse.data.data || [];
      const filteredExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.transaction_date || expense.expense_date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      // Calculer les entrées
      const incomeTransactions = [];
      let totalIncome = 0;

      // Entrées des factures
      filteredInvoices.forEach(invoice => {
        const paidAmount = parseFloat(invoice.paid_amount || 0);
        if (paidAmount > 0) {
          incomeTransactions.push({
            id: `INV-${invoice.id}`,
            date: new Date(invoice.created_at),
            type: 'Facture',
            reference: invoice.invoice_number,
            description: `Paiement - ${invoice.patient_name}`,
            amount: paidAmount,
            payment_method: invoice.payment_method || 'N/A'
          });
          totalIncome += paidAmount;
        }
      });

      // Entrées de la pharmacie
      pharmacySales.forEach(sale => {
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach(item => {
            const amount = parseFloat(item.total_price || 0);
            incomeTransactions.push({
              id: `PHARM-${sale.id}-${item.id}`,
              date: new Date(sale.exit_date),
              type: 'Pharmacie',
              reference: sale.exit_number || '-',
              description: item.product_name,
              amount: amount,
              payment_method: 'CASH'
            });
            totalIncome += amount;
          });
        }
      });

      // Calculer les sorties
      const expenseTransactions = [];
      let totalExpenses = 0;

      filteredExpenses.forEach(expense => {
        const amount = parseFloat(expense.amount || 0);
        expenseTransactions.push({
          id: `EXP-${expense.id}`,
          date: new Date(expense.transaction_date || expense.expense_date),
          type: 'Dépense',
          reference: expense.expense_number || '-',
          description: `${expense.category} - ${expense.description || 'N/A'}`,
          amount: amount,
          payment_method: expense.payment_method,
          status: expense.status
        });
        totalExpenses += amount;
      });

      // Trier par date décroissante
      incomeTransactions.sort((a, b) => b.date - a.date);
      expenseTransactions.sort((a, b) => b.date - a.date);

      setFinancialSummary({
        income: incomeTransactions,
        expenses: expenseTransactions,
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses
      });
    } catch (error) {
      console.error('Erreur lors du chargement du récapitulatif financier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryDateRangeChange = (e) => {
    setSummaryDateRange({
      ...summaryDateRange,
      [e.target.name]: e.target.value
    });
  };

  const applySummaryDateFilter = () => {
    loadFinancialSummary();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 0 }}>
            Comptabilité
          </h1>
        </div>
        <p style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: '1rem', fontWeight: 500 }}>
          Gestion financière complète
        </p>
      </div>

      {/* Onglets */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.5rem',
        background: 'var(--light-bg, #f8f9fa)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <button
          onClick={() => setActiveTab('caisse')}
          style={{
            padding: '0.875rem 1.5rem',
            background: activeTab === 'caisse' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'caisse' ? 'var(--primary-color)' : 'var(--secondary-color)',
            fontWeight: activeTab === 'caisse' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'caisse' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transform: activeTab === 'caisse' ? 'translateY(-1px)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'caisse') {
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'caisse') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <FaCashRegister style={{ fontSize: '1.1rem' }} /> Sessions de Caisse
        </button>
        <button
          onClick={() => setActiveTab('pharmacie')}
          style={{
            padding: '0.875rem 1.5rem',
            background: activeTab === 'pharmacie' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'pharmacie' ? 'var(--primary-color)' : 'var(--secondary-color)',
            fontWeight: activeTab === 'pharmacie' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'pharmacie' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transform: activeTab === 'pharmacie' ? 'translateY(-1px)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pharmacie') {
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pharmacie') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <FaPills style={{ fontSize: '1.1rem' }} /> Pharmacie
        </button>
        <button
          onClick={() => setActiveTab('achats')}
          style={{
            padding: '0.875rem 1.5rem',
            background: activeTab === 'achats' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'achats' ? 'var(--primary-color)' : 'var(--secondary-color)',
            fontWeight: activeTab === 'achats' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'achats' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transform: activeTab === 'achats' ? 'translateY(-1px)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'achats') {
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'achats') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <FaShoppingCart style={{ fontSize: '1.1rem' }} /> Achats & Dépenses
        </button>
        <button
          onClick={() => setActiveTab('recap')}
          style={{
            padding: '0.875rem 1.5rem',
            background: activeTab === 'recap' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'recap' ? 'var(--primary-color)' : 'var(--secondary-color)',
            fontWeight: activeTab === 'recap' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'recap' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transform: activeTab === 'recap' ? 'translateY(-1px)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'recap') {
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'recap') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <FaClipboardList style={{ fontSize: '1.1rem' }} /> Récapitulatif
        </button>
      </div>

      {/* Contenu des onglets */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>}

      {/* Onglet Sessions de Caisse */}
      {activeTab === 'caisse' && !loading && (
        <div>
          {!selectedSession ? (
            <>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date début</label>
                  <input
                    type="date"
                    name="startDate"
                    value={cashDateRange.startDate}
                    onChange={handleCashDateRangeChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date fin</label>
                  <input
                    type="date"
                    name="endDate"
                    value={cashDateRange.endDate}
                    onChange={handleCashDateRangeChange}
                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <button
                  onClick={applyCashDateFilter}
                  className="button button-primary"
                  style={{ marginTop: '1.7rem' }}
                >
                  <FaCalendarAlt /> Filtrer
                </button>
              </div>

              {/* Récapitulatif global de la période */}
              {cashSessions.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-title">Total factures</span>
                      <FaFileInvoice style={{ color: 'var(--info-color)', fontSize: '1.5rem' }} />
                    </div>
                    <div className="stat-card-value">
                      {cashSessions.reduce((sum, s) => sum + s.count, 0)}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-title">Montant total</span>
                      <FaMoneyBillWave style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
                    </div>
                    <div className="stat-card-value">
                      {cashSessions.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()} FCFA
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-title">Total payé</span>
                      <FaMoneyBillWave style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }} />
                    </div>
                    <div className="stat-card-value">
                      {cashSessions.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()} FCFA
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-title">Reste à payer</span>
                      <FaMoneyBillWave style={{ color: 'var(--warning-color)', fontSize: '1.5rem' }} />
                    </div>
                    <div className="stat-card-value">
                      {cashSessions.reduce((sum, s) => sum + s.totalRemaining, 0).toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Récapitulatif par date</h2>
                </div>
                <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Nombre de factures</th>
                      <th>Montant total</th>
                      <th>Payé</th>
                      <th>Reste</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashSessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          Aucune session trouvée
                        </td>
                      </tr>
                    ) : (
                      cashSessions.map((session, index) => (
                        <tr key={index}>
                          <td><strong>{session.date}</strong></td>
                          <td>{session.count}</td>
                          <td><strong>{session.totalAmount.toLocaleString()} FCFA</strong></td>
                          <td style={{ color: 'var(--success-color)' }}><strong>{session.totalPaid.toLocaleString()} FCFA</strong></td>
                          <td style={{ color: session.totalRemaining > 0 ? 'var(--danger-color)' : 'inherit' }}>
                            <strong>{session.totalRemaining.toLocaleString()} FCFA</strong>
                          </td>
                          <td>
                            <button
                              onClick={() => viewSessionDetails(session)}
                              className="icon-button"
                              title="Voir les détails"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          ) : (
            <div>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="card-title">Détails de la session du {selectedSession.date}</h2>
                  <button onClick={closeSessionDetails} className="icon-button" title="Fermer">
                    <FaTimes />
                  </button>
                </div>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <span className="stat-card-title">Nombre de factures</span>
                        <FaFileInvoice style={{ color: 'var(--info-color)', fontSize: '1.5rem' }} />
                      </div>
                      <div className="stat-card-value">{selectedSession.count}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <span className="stat-card-title">Montant total</span>
                        <FaMoneyBillWave style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
                      </div>
                      <div className="stat-card-value">{selectedSession.totalAmount.toLocaleString()} FCFA</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <span className="stat-card-title">Montant payé</span>
                        <FaMoneyBillWave style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }} />
                      </div>
                      <div className="stat-card-value">{selectedSession.totalPaid.toLocaleString()} FCFA</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <span className="stat-card-title">Reste à payer</span>
                        <FaMoneyBillWave style={{ color: 'var(--warning-color)', fontSize: '1.5rem' }} />
                      </div>
                      <div className="stat-card-value">{selectedSession.totalRemaining.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Récapitulatif par type de facture */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Récapitulatif par type de facture</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Nombre</th>
                        <th>Montant total</th>
                        <th>Payé</th>
                        <th>Reste</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Avec assurance</strong></td>
                        <td>{selectedSession.withInsurance.count}</td>
                        <td>{selectedSession.withInsurance.amount.toLocaleString()} FCFA</td>
                        <td>{selectedSession.withInsurance.paid.toLocaleString()} FCFA</td>
                        <td>{selectedSession.withInsurance.remaining.toLocaleString()} FCFA</td>
                      </tr>
                      <tr>
                        <td><strong>Sans assurance</strong></td>
                        <td>{selectedSession.withoutInsurance.count}</td>
                        <td>{selectedSession.withoutInsurance.amount.toLocaleString()} FCFA</td>
                        <td>{selectedSession.withoutInsurance.paid.toLocaleString()} FCFA</td>
                        <td>{selectedSession.withoutInsurance.remaining.toLocaleString()} FCFA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Récapitulatif par acte */}
              {Object.keys(selectedSession.byService).length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="card-header">
                    <h3 className="card-title">Récapitulatif par acte / service</h3>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Acte / Service</th>
                          <th>Nombre</th>
                          <th>Montant total</th>
                          <th>Payé</th>
                          <th>Reste</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(selectedSession.byService).map((service, index) => (
                          <tr key={index}>
                            <td>{service.name}</td>
                            <td>{service.count}</td>
                            <td>{service.amount.toLocaleString()} FCFA</td>
                            <td>{service.paid.toLocaleString()} FCFA</td>
                            <td>{service.remaining.toLocaleString()} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Liste des factures */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">Liste des factures</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                    {sessionDetails.length} facture{sessionDetails.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>N° Facture</th>
                        <th>Patient</th>
                        <th>Type</th>
                        <th>Montant</th>
                        <th>Payé</th>
                        <th>Reste</th>
                        <th>Statut paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoices.map((invoice) => {
                        const hasInsurance = invoice.has_insurance || invoice.insurance_company_id || parseFloat(invoice.insurance_covered || 0) > 0;
                        const totalAmount = parseFloat(invoice.patient_responsibility || invoice.total_amount || 0);
                        const paidAmount = parseFloat(invoice.paid_amount || 0);
                        const remainingAmount = totalAmount - paidAmount;

                        // Déterminer le statut de paiement
                        let paymentStatus = 'UNPAID';
                        if (paidAmount >= totalAmount && totalAmount > 0) {
                          paymentStatus = 'PAID';
                        } else if (paidAmount > 0) {
                          paymentStatus = 'PARTIAL';
                        }

                        return (
                          <tr key={invoice.id}>
                            <td>{invoice.invoice_number}</td>
                            <td>{invoice.patient_name}</td>
                            <td>
                              <span className={`badge ${hasInsurance ? 'badge-info' : 'badge-secondary'}`}>
                                {hasInsurance ? 'Assurance' : 'Direct'}
                              </span>
                            </td>
                            <td><strong>{totalAmount.toLocaleString()} FCFA</strong></td>
                            <td style={{ color: paidAmount > 0 ? 'var(--success-color)' : 'inherit' }}>
                              <strong>{paidAmount.toLocaleString()} FCFA</strong>
                            </td>
                            <td style={{ color: remainingAmount > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                              <strong>{remainingAmount.toLocaleString()} FCFA</strong>
                            </td>
                            <td>
                              <span className={`badge ${paymentStatus === 'PAID' ? 'badge-success' : paymentStatus === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                                {paymentStatus === 'PAID' ? 'Payée' : paymentStatus === 'PARTIAL' ? 'Partielle' : 'Non payée'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, sessionDetails.length)} sur {sessionDetails.length} factures
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="button button-secondary"
                        style={{
                          padding: '0.5rem 1rem',
                          opacity: currentPage === 1 ? 0.5 : 1,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Précédent
                      </button>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'button button-primary' : 'button button-secondary'}
                            style={{
                              padding: '0.5rem 0.75rem',
                              minWidth: '2.5rem'
                            }}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="button button-secondary"
                        style={{
                          padding: '0.5rem 1rem',
                          opacity: currentPage === totalPages ? 0.5 : 1,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet Pharmacie */}
      {activeTab === 'pharmacie' && !loading && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date début</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date fin</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <button
              onClick={applyDateFilter}
              className="button button-primary"
              style={{ marginTop: '1.7rem' }}
            >
              <FaCalendarAlt /> Filtrer
            </button>
          </div>

          {pharmacyStats && (
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Revenus pharmacie</span>
                  <FaMoneyBillWave style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">{pharmacyStats.totalRevenue.toLocaleString()} FCFA</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Coût des ventes</span>
                  <FaChartLine style={{ color: 'var(--danger-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">{pharmacyStats.totalCost.toLocaleString()} FCFA</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Bénéfice</span>
                  <FaMoneyBillWave style={{ color: 'var(--info-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">{pharmacyStats.profit.toLocaleString()} FCFA</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Nombre de ventes</span>
                  <FaPills style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">{pharmacyStats.salesCount}</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Détails des ventes</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>N° Vente</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Montant total</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacySales.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucune vente trouvée pour cette période
                      </td>
                    </tr>
                  ) : (
                    pharmacySales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</td>
                        <td>{sale.sale_number || '-'}</td>
                        <td>{sale.product_name}</td>
                        <td>{sale.quantity}</td>
                        <td>{parseFloat(sale.unit_price).toLocaleString()} FCFA</td>
                        <td>{parseFloat(sale.total_amount).toLocaleString()} FCFA</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Achats & Dépenses */}
      {activeTab === 'achats' && !loading && (
        <div>
          {/* Filtre de date */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date début</label>
              <input
                type="date"
                name="startDate"
                value={expenseDateRange.startDate}
                onChange={handleExpenseDateRangeChange}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date fin</label>
              <input
                type="date"
                name="endDate"
                value={expenseDateRange.endDate}
                onChange={handleExpenseDateRangeChange}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <button
              onClick={applyExpenseDateFilter}
              className="button button-primary"
              style={{ marginTop: '1.7rem' }}
            >
              <FaCalendarAlt /> Filtrer
            </button>
          </div>

          {/* Statistiques des dépenses */}
          {expenses.length > 0 && (
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total dépenses</span>
                  <FaMoneyBillWave style={{ color: 'var(--danger-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">
                  {expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()} FCFA
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Nombre de dépenses</span>
                  <FaShoppingCart style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">
                  {expenses.length}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Dépenses approuvées</span>
                  <FaChartLine style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">
                  {expenses.filter(exp => exp.status === 'APPROVED').length}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">En attente</span>
                  <FaChartLine style={{ color: 'var(--warning-color)', fontSize: '1.5rem' }} />
                </div>
                <div className="stat-card-value">
                  {expenses.filter(exp => exp.status === 'PENDING').length}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Liste des achats et dépenses</h2>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="button button-primary"
              >
                <FaPlus /> Nouvelle dépense
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Mode de paiement</th>
                    <th>Description</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucune dépense enregistrée
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{new Date(expense.transaction_date || expense.expense_date).toLocaleDateString('fr-FR')}</td>
                        <td>{expense.category}</td>
                        <td>{parseFloat(expense.amount).toLocaleString()} FCFA</td>
                        <td>{expense.payment_method}</td>
                        <td>{expense.description || '-'}</td>
                        <td>
                          <span className={`badge ${expense.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                            {expense.status === 'APPROVED' ? 'Approuvée' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Récapitulatif Financier */}
      {activeTab === 'recap' && !loading && (
        <div className="printable-section">
          {/* Filtre de date */}
          <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date début</label>
                <input
                  type="date"
                  name="startDate"
                  value={summaryDateRange.startDate}
                  onChange={handleSummaryDateRangeChange}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={summaryDateRange.endDate}
                  onChange={handleSummaryDateRangeChange}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
              <button
                onClick={applySummaryDateFilter}
                className="button button-primary"
                style={{ marginTop: '1.7rem' }}
              >
                <FaCalendarAlt /> Filtrer
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="button button-secondary"
              style={{ marginTop: '1.7rem' }}
            >
              <FaPrint /> Imprimer
            </button>
          </div>

          {/* En-tête pour l'impression */}
          <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Récapitulatif Financier
            </h1>
            <p style={{ fontSize: '1rem', color: '#666' }}>
              Du {new Date(summaryDateRange.startDate).toLocaleDateString('fr-FR')} au {new Date(summaryDateRange.endDate).toLocaleDateString('fr-FR')}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
              Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>

          {/* Statistiques globales */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Entrées</span>
                <FaMoneyBillWave style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success-color)' }}>
                {financialSummary.totalIncome.toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>
                {financialSummary.income.length} transaction{financialSummary.income.length > 1 ? 's' : ''}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Sorties</span>
                <FaShoppingCart style={{ color: 'var(--danger-color)', fontSize: '1.5rem' }} />
              </div>
              <div className="stat-card-value" style={{ color: 'var(--danger-color)' }}>
                {financialSummary.totalExpenses.toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>
                {financialSummary.expenses.length} transaction{financialSummary.expenses.length > 1 ? 's' : ''}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Solde Net</span>
                <FaChartLine style={{ color: financialSummary.netBalance >= 0 ? 'var(--primary-color)' : 'var(--danger-color)', fontSize: '1.5rem' }} />
              </div>
              <div className="stat-card-value" style={{ color: financialSummary.netBalance >= 0 ? 'var(--primary-color)' : 'var(--danger-color)' }}>
                {financialSummary.netBalance.toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>
                {financialSummary.netBalance >= 0 ? 'Bénéfice' : 'Déficit'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Transactions</span>
                <FaClipboardList style={{ color: 'var(--info-color)', fontSize: '1.5rem' }} />
              </div>
              <div className="stat-card-value">
                {financialSummary.income.length + financialSummary.expenses.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>
                Entrées + Sorties
              </div>
            </div>
          </div>

          {/* Tableau des entrées */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--success-color)' }}>
                Entrées ({financialSummary.income.length})
              </h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Référence</th>
                    <th>Description</th>
                    <th>Mode paiement</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {financialSummary.income.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucune entrée pour cette période
                      </td>
                    </tr>
                  ) : (
                    financialSummary.income.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date.toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`badge ${transaction.type === 'Facture' ? 'badge-info' : 'badge-success'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.reference}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.payment_method}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                          +{transaction.amount.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))
                  )}
                  {financialSummary.income.length > 0 && (
                    <tr style={{ backgroundColor: 'var(--light-bg, #f8f9fa)', fontWeight: 600 }}>
                      <td colSpan="5" style={{ textAlign: 'right' }}>Total Entrées:</td>
                      <td style={{ color: 'var(--success-color)' }}>
                        +{financialSummary.totalIncome.toLocaleString()} FCFA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau des sorties */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--danger-color)' }}>
                Sorties ({financialSummary.expenses.length})
              </h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Référence</th>
                    <th>Description</th>
                    <th>Mode paiement</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {financialSummary.expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        Aucune sortie pour cette période
                      </td>
                    </tr>
                  ) : (
                    financialSummary.expenses.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date.toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className="badge badge-danger">
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.reference}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.payment_method}</td>
                        <td style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                          -{transaction.amount.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))
                  )}
                  {financialSummary.expenses.length > 0 && (
                    <tr style={{ backgroundColor: 'var(--light-bg, #f8f9fa)', fontWeight: 600 }}>
                      <td colSpan="5" style={{ textAlign: 'right' }}>Total Sorties:</td>
                      <td style={{ color: 'var(--danger-color)' }}>
                        -{financialSummary.totalExpenses.toLocaleString()} FCFA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé final */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Résumé Financier</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <table style={{ width: '100%', fontSize: '1.1rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>Total Entrées</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success-color)', fontWeight: 600 }}>
                      +{financialSummary.totalIncome.toLocaleString()} FCFA
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>Total Sorties</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger-color)', fontWeight: 600 }}>
                      -{financialSummary.totalExpenses.toLocaleString()} FCFA
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--light-bg, #f8f9fa)', fontSize: '1.3rem' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>Solde Net</td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      color: financialSummary.netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)',
                      fontWeight: 700
                    }}>
                      {financialSummary.netBalance >= 0 ? '+' : ''}{financialSummary.netBalance.toLocaleString()} FCFA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de dépense */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle dépense</h2>
              <button
                className="modal-close"
                onClick={() => setShowExpenseModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={submitExpense}>
              <div className="form-group">
                <label>Catégorie *</label>
                <select
                  name="category"
                  value={expenseForm.category}
                  onChange={handleExpenseFormChange}
                  required
                >
                  <option value="FOURNITURES">Fournitures</option>
                  <option value="EQUIPEMENT">Équipement</option>
                  <option value="SALAIRES">Salaires</option>
                  <option value="LOYER">Loyer</option>
                  <option value="ELECTRICITE">Électricité</option>
                  <option value="EAU">Eau</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Montant (FCFA) *</label>
                <input
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseFormChange}
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="form-group">
                <label>Mode de paiement *</label>
                <select
                  name="payment_method"
                  value={expenseForm.payment_method}
                  onChange={handleExpenseFormChange}
                  required
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="CHECK">Chèque</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseFormChange}
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
