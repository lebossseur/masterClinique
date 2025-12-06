const db = require('../config/database');

// Ouvrir une caisse
exports.openCashRegister = async (req, res) => {
  try {
    const { opening_amount, notes } = req.body;
    const cashier_id = req.user.id;

    // Vérifier si la caissière a déjà une caisse ouverte
    const [openRegisters] = await db.query(
      'SELECT * FROM cash_registers WHERE cashier_id = ? AND status = "OPEN"',
      [cashier_id]
    );

    if (openRegisters.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une caisse ouverte. Veuillez la fermer avant d\'en ouvrir une nouvelle.'
      });
    }

    // Créer une nouvelle session de caisse
    const [result] = await db.query(
      `INSERT INTO cash_registers (
        cashier_id, opening_date, opening_time, opening_amount, notes, status
      ) VALUES (?, CURDATE(), CURTIME(), ?, ?, 'OPEN')`,
      [cashier_id, opening_amount || 0, notes || null]
    );

    const [newRegister] = await db.query(
      `SELECT cr.*,
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM cash_registers cr
       JOIN users u ON cr.cashier_id = u.id
       WHERE cr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Caisse ouverte avec succès.',
      data: newRegister[0]
    });

  } catch (error) {
    console.error('Open cash register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ouverture de la caisse.',
      error: error.message
    });
  }
};

// Récupérer la caisse active de l'utilisateur connecté
exports.getActiveCashRegister = async (req, res) => {
  try {
    const cashier_id = req.user.id;

    const [registers] = await db.query(
      `SELECT cr.*,
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
              COALESCE(SUM(p.amount), 0) as total_collected
       FROM cash_registers cr
       JOIN users u ON cr.cashier_id = u.id
       LEFT JOIN payments p ON cr.id = p.cash_register_id
       WHERE cr.cashier_id = ? AND cr.status = 'OPEN'
       GROUP BY cr.id`,
      [cashier_id]
    );

    if (registers.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: registers[0]
    });

  } catch (error) {
    console.error('Get active cash register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la caisse active.'
    });
  }
};

// Récupérer les détails d'une caisse
exports.getCashRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    const [registers] = await db.query(
      `SELECT cr.*,
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM cash_registers cr
       JOIN users u ON cr.cashier_id = u.id
       WHERE cr.id = ?`,
      [id]
    );

    if (registers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caisse non trouvée.'
      });
    }

    // Récupérer les paiements de cette caisse
    const [payments] = await db.query(
      `SELECT p.*,
              i.invoice_number,
              CONCAT(pat.first_name, ' ', pat.last_name) as patient_name
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN patients pat ON i.patient_id = pat.id
       WHERE p.cash_register_id = ?
       ORDER BY p.payment_date DESC, p.payment_time DESC`,
      [id]
    );

    // Calculer les totaux par mode de paiement
    const [paymentMethods] = await db.query(
      `SELECT payment_method, SUM(amount) as total
       FROM payments
       WHERE cash_register_id = ?
       GROUP BY payment_method`,
      [id]
    );

    res.json({
      success: true,
      data: {
        register: registers[0],
        payments: payments,
        paymentMethods: paymentMethods
      }
    });

  } catch (error) {
    console.error('Get cash register by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de la caisse.'
    });
  }
};

// Clôturer une caisse
exports.closeCashRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const { closing_amount, notes } = req.body;
    const cashier_id = req.user.id;

    // Vérifier que la caisse existe et appartient à l'utilisateur
    const [registers] = await db.query(
      'SELECT * FROM cash_registers WHERE id = ? AND cashier_id = ? AND status = "OPEN"',
      [id, cashier_id]
    );

    if (registers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caisse non trouvée ou déjà fermée.'
      });
    }

    // Calculer le montant attendu
    const [payments] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE cash_register_id = ?',
      [id]
    );

    const expected_amount = parseFloat(registers[0].opening_amount) + parseFloat(payments[0].total);
    const difference = parseFloat(closing_amount) - expected_amount;

    // Fermer la caisse
    await db.query(
      `UPDATE cash_registers
       SET closing_date = CURDATE(),
           closing_time = CURTIME(),
           closing_amount = ?,
           expected_amount = ?,
           difference = ?,
           notes = CONCAT(IFNULL(notes, ''), ?, ?),
           status = 'CLOSED'
       WHERE id = ?`,
      [
        closing_amount,
        expected_amount,
        difference,
        notes ? '\n--- Clôture ---\n' : '',
        notes || '',
        id
      ]
    );

    // Récupérer les détails complets de la caisse fermée
    const [closedRegister] = await db.query(
      `SELECT cr.*,
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM cash_registers cr
       JOIN users u ON cr.cashier_id = u.id
       WHERE cr.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Caisse fermée avec succès.',
      data: closedRegister[0]
    });

  } catch (error) {
    console.error('Close cash register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la fermeture de la caisse.',
      error: error.message
    });
  }
};

// Récupérer l'historique des caisses
exports.getAllCashRegisters = async (req, res) => {
  try {
    const { status, cashier_id, date_from, date_to } = req.query;

    let query = `
      SELECT cr.*,
             CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
             COALESCE(SUM(p.amount), 0) as total_collected
      FROM cash_registers cr
      JOIN users u ON cr.cashier_id = u.id
      LEFT JOIN payments p ON cr.id = p.cash_register_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND cr.status = ?';
      params.push(status);
    }

    if (cashier_id) {
      query += ' AND cr.cashier_id = ?';
      params.push(cashier_id);
    }

    if (date_from) {
      query += ' AND cr.opening_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND cr.opening_date <= ?';
      params.push(date_to);
    }

    query += ' GROUP BY cr.id ORDER BY cr.opening_date DESC, cr.opening_time DESC';

    const [registers] = await db.query(query, params);

    res.json({
      success: true,
      data: registers
    });

  } catch (error) {
    console.error('Get all cash registers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique des caisses.'
    });
  }
};
