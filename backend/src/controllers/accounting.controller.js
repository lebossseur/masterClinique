const db = require('../config/database');

exports.getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT at.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM accounting_transactions at
       LEFT JOIN users u ON at.created_by = u.id
       ORDER BY at.transaction_date DESC, at.created_at DESC`
    );

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transactions.'
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Revenus du jour (basés sur les paiements effectivement reçus)
    const [incomeToday] = await db.query(
      `SELECT SUM(amount) as total FROM payments
       WHERE payment_date = CURDATE()`
    );

    // Dépenses du jour
    const [expenseToday] = await db.query(
      `SELECT SUM(amount) as total FROM accounting_transactions
       WHERE transaction_type = 'EXPENSE' AND transaction_date = CURDATE()`
    );

    // Revenus du mois (basés sur les paiements effectivement reçus)
    const [incomeMonth] = await db.query(
      `SELECT SUM(amount) as total FROM payments
       WHERE MONTH(payment_date) = MONTH(CURDATE())
       AND YEAR(payment_date) = YEAR(CURDATE())`
    );

    // Dépenses du mois
    const [expenseMonth] = await db.query(
      `SELECT SUM(amount) as total FROM accounting_transactions
       WHERE transaction_type = 'EXPENSE' AND MONTH(transaction_date) = MONTH(CURDATE())
       AND YEAR(transaction_date) = YEAR(CURDATE())`
    );

    // Factures en attente (non payées et partiellement payées)
    const [pendingInvoices] = await db.query(
      `SELECT
        COUNT(*) as count,
        SUM(i.patient_responsibility - COALESCE(p.total_paid, 0)) as total
       FROM invoices i
       LEFT JOIN (
         SELECT invoice_id, SUM(amount) as total_paid
         FROM payments
         GROUP BY invoice_id
       ) p ON i.id = p.invoice_id
       WHERE i.status IN ('PENDING', 'PARTIAL')`
    );

    // Statistiques détaillées des factures
    const [invoiceStats] = await db.query(
      `SELECT
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_billed,
        SUM(patient_responsibility) as total_patient_due
       FROM invoices
       WHERE invoice_date = CURDATE()`
    );

    const todayIncome = parseFloat(incomeToday[0]?.total || 0);
    const todayExpense = parseFloat(expenseToday[0]?.total || 0);
    const monthIncome = parseFloat(incomeMonth[0]?.total || 0);
    const monthExpense = parseFloat(expenseMonth[0]?.total || 0);

    res.json({
      success: true,
      data: {
        today: {
          income: todayIncome,
          expense: todayExpense,
          net: todayIncome - todayExpense,
          invoices: invoiceStats[0]?.total_invoices || 0,
          billed: parseFloat(invoiceStats[0]?.total_billed || 0)
        },
        month: {
          income: monthIncome,
          expense: monthExpense,
          net: monthIncome - monthExpense
        },
        pending: {
          count: pendingInvoices[0]?.count || 0,
          total: parseFloat(pendingInvoices[0]?.total || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques.'
    });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const [expenses] = await db.query(
      `SELECT e.*,
              CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
              CONCAT(u2.first_name, ' ', u2.last_name) as approved_by_name
       FROM expenses e
       LEFT JOIN users u1 ON e.created_by = u1.id
       LEFT JOIN users u2 ON e.approved_by = u2.id
       ORDER BY e.created_at DESC`
    );

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dépenses.'
    });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const {
      transaction_date, category, description, amount,
      payment_method, vendor, receipt_number
    } = req.body;

    if (!category || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    // Générer un numéro de dépense unique
    const expense_number = `EXP-${Date.now()}`;
    const expense_date = transaction_date || new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO expenses (expense_number, expense_date, category, description,
       amount, payment_method, vendor, receipt_number, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [expense_number, expense_date, category, description || '', amount,
       payment_method, vendor || null, receipt_number || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Dépense créée avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la dépense.'
    });
  }
};

exports.approveExpense = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [expense] = await connection.query(
      'SELECT * FROM expenses WHERE id = ?',
      [req.params.id]
    );

    if (expense.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée.'
      });
    }

    await connection.query(
      'UPDATE expenses SET status = ?, approved_by = ? WHERE id = ?',
      ['APPROVED', req.user.id, req.params.id]
    );

    const transactionNumber = `TRX-${Date.now()}`;
    await connection.query(
      `INSERT INTO accounting_transactions (transaction_number, transaction_date,
       transaction_type, category, amount, payment_method, reference_type,
       reference_id, description, created_by)
       VALUES (?, ?, 'EXPENSE', ?, ?, ?, 'EXPENSE', ?, ?, ?)`,
      [transactionNumber, expense[0].expense_date, expense[0].category,
       expense[0].amount, expense[0].payment_method, req.params.id,
       expense[0].description, req.user.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Dépense approuvée avec succès.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de la dépense.'
    });
  } finally {
    connection.release();
  }
};
