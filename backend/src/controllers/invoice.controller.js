const db = require('../config/database');

// Créer une facture à partir d'une admission
exports.createInvoice = async (req, res) => {
  try {
    const { admission_id, invoice_type } = req.body;

    if (!admission_id) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'admission requis.'
      });
    }

    // Récupérer les détails de l'admission
    const [admissions] = await db.query(
      `SELECT a.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              p.patient_number, p.phone, p.email, p.address,
              ic.name as insurance_company_name
       FROM admissions a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
       WHERE a.id = ?`,
      [admission_id]
    );

    if (admissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admission non trouvée.'
      });
    }

    const admission = admissions[0];

    // Récupérer les services de l'admission
    const [services] = await db.query(
      `SELECT * FROM admission_services WHERE admission_id = ?`,
      [admission_id]
    );

    // Utiliser le type fourni ou TICKET par défaut
    const invoiceType = invoice_type || 'TICKET';

    // Générer le numéro de facture
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const [todayInvoices] = await db.query(
      'SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1',
      [`F${datePrefix}%`]
    );

    let counter = 1;
    if (todayInvoices.length > 0) {
      const lastNumber = todayInvoices[0].invoice_number;
      counter = parseInt(lastNumber.slice(-4)) + 1;
    }

    const invoice_number = `F${datePrefix}${String(counter).padStart(4, '0')}`;

    // Déterminer le statut: vérifier si c'est un contrôle via le champ is_control de l'admission
    const isControl = admission.is_control === 1 || admission.is_control === true;
    const invoiceStatus = isControl ? 'CONTROLE' : 'PENDING';

    // Créer la facture
    const [invoiceResult] = await db.query(
      `INSERT INTO invoices (
        invoice_number, patient_id, admission_id, invoice_date, invoice_type,
        subtotal, total_amount, insurance_covered, patient_responsibility,
        status, created_by
      ) VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        admission.patient_id,
        admission_id,
        invoiceType,
        admission.base_price,
        admission.base_price,
        admission.insurance_amount || 0,
        admission.patient_amount,
        invoiceStatus,
        req.user.id
      ]
    );

    const invoice_id = invoiceResult.insertId;

    // Créer les lignes de facture (invoice_items)
    for (const service of services) {
      await db.query(
        `INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, total_price
        ) VALUES (?, ?, 1, ?, ?)`,
        [
          invoice_id,
          service.service_name,
          service.base_price,
          service.base_price
        ]
      );
    }

    // Si c'est un contrôle, créer automatiquement un paiement de 0 FCFA
    if (isControl) {
      // Générer le numéro de paiement
      const paymentDatePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

      const [todayPayments] = await db.query(
        'SELECT payment_number FROM payments WHERE payment_number LIKE ? ORDER BY payment_number DESC LIMIT 1',
        [`P${paymentDatePrefix}%`]
      );

      let paymentCounter = 1;
      if (todayPayments.length > 0) {
        const lastNumber = todayPayments[0].payment_number;
        paymentCounter = parseInt(lastNumber.slice(-4)) + 1;
      }

      const payment_number = `P${paymentDatePrefix}${String(paymentCounter).padStart(4, '0')}`;

      // Vérifier si l'utilisateur a une caisse ouverte
      const [activeRegister] = await db.query(
        'SELECT id FROM cash_registers WHERE cashier_id = ? AND status = "OPEN"',
        [req.user.id]
      );

      const cash_register_id = activeRegister.length > 0 ? activeRegister[0].id : null;

      // Créer le paiement de 0 FCFA pour le contrôle
      await db.query(
        `INSERT INTO payments (
          invoice_id, cash_register_id, payment_number, payment_date, payment_time,
          amount, payment_method, notes, received_by
        ) VALUES (?, ?, ?, CURDATE(), CURTIME(), 0, 'CASH', 'Contrôle gratuit - Aucun paiement requis', ?)`,
        [invoice_id, cash_register_id, payment_number, req.user.id]
      );

      console.log(`Paiement automatique de 0 FCFA créé pour le contrôle - Facture ${invoice_number}`);
    }

    // Mettre à jour le statut de l'admission
    await db.query(
      'UPDATE admissions SET status = ? WHERE id = ?',
      ['BILLED', admission_id]
    );

    // Récupérer les informations complètes de la facture
    const [invoiceData] = await db.query(
      `SELECT i.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              p.patient_number, p.phone, p.email, p.address,
              a.admission_number, a.has_insurance, a.insurance_company_id,
              ic.name as insurance_company_name, a.insurance_number
       FROM invoices i
       JOIN patients p ON i.patient_id = p.id
       JOIN admissions a ON i.admission_id = a.id
       LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
       WHERE i.id = ?`,
      [invoice_id]
    );

    // Récupérer les lignes de facture avec les détails des services
    const [items] = await db.query(
      `SELECT ii.*,
              asv.service_code, asv.insurance_covered, asv.patient_pays
       FROM invoice_items ii
       LEFT JOIN admission_services asv ON ii.description = asv.service_name AND asv.admission_id = ?
       WHERE ii.invoice_id = ?`,
      [admission_id, invoice_id]
    );

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès.',
      data: {
        invoice: invoiceData[0],
        items: items,
        services: services
      }
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture.',
      error: error.message
    });
  }
};

// Récupérer toutes les factures
exports.getAllInvoices = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              p.patient_number,
              a.has_insurance,
              a.insurance_company_id,
              ic.name as insurance_company_name,
              a.insurance_number,
              COALESCE((SELECT SUM(pay.amount)
                        FROM payments pay
                        WHERE pay.invoice_id = i.id), 0) as paid_amount,
              CASE
                WHEN COALESCE((SELECT SUM(pay.amount) FROM payments pay WHERE pay.invoice_id = i.id), 0) >= i.patient_responsibility THEN 'PAID'
                WHEN COALESCE((SELECT SUM(pay.amount) FROM payments pay WHERE pay.invoice_id = i.id), 0) > 0 THEN 'PARTIAL'
                ELSE 'UNPAID'
              END as payment_status
       FROM invoices i
       JOIN patients p ON i.patient_id = p.id
       LEFT JOIN admissions a ON i.admission_id = a.id
       LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
       ORDER BY i.created_at DESC`
    );

    // Récupérer les items pour chaque facture
    for (let invoice of invoices) {
      const [items] = await db.query(
        `SELECT ii.*,
                asv.service_code, asv.insurance_covered, asv.patient_pays
         FROM invoice_items ii
         LEFT JOIN admission_services asv ON ii.description = asv.service_name AND asv.admission_id = ?
         WHERE ii.invoice_id = ?`,
        [invoice.admission_id, invoice.id]
      );
      invoice.items = items;
    }

    // Debug: Logger un exemple de facture
    if (invoices.length > 0) {
      console.log('=== EXEMPLE FACTURE ===');
      console.log('Invoice Number:', invoices[0].invoice_number);
      console.log('Patient Responsibility:', invoices[0].patient_responsibility);
      console.log('Paid Amount:', invoices[0].paid_amount);
      console.log('Status:', invoices[0].status);
      console.log('Payment Status:', invoices[0].payment_status);
      console.log('====================');
    }

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures.'
    });
  }
};

// Récupérer une facture par ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoices] = await db.query(
      `SELECT i.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              p.patient_number, p.phone, p.email, p.address,
              a.admission_number, a.has_insurance,
              ic.name as insurance_company_name, a.insurance_number
       FROM invoices i
       JOIN patients p ON i.patient_id = p.id
       LEFT JOIN admissions a ON i.admission_id = a.id
       LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée.'
      });
    }

    const [items] = await db.query(
      `SELECT ii.*,
              asv.service_code, asv.insurance_covered, asv.patient_pays
       FROM invoice_items ii
       LEFT JOIN admission_services asv ON ii.description = asv.service_name AND asv.admission_id = ?
       WHERE ii.invoice_id = ?`,
      [invoices[0].admission_id, id]
    );

    res.json({
      success: true,
      data: {
        invoice: invoices[0],
        items: items
      }
    });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture.'
    });
  }
};

// Récupérer les paiements d'une facture
exports.getInvoicePayments = async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await db.query(
      `SELECT p.*,
              CONCAT(u.first_name, ' ', u.last_name) as received_by_name
       FROM payments p
       LEFT JOIN users u ON p.received_by = u.id
       WHERE p.invoice_id = ?
       ORDER BY p.payment_date DESC, p.payment_time DESC`,
      [id]
    );

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get invoice payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements.'
    });
  }
};

// Enregistrer un paiement
exports.recordPayment = async (req, res) => {
  try {
    const { invoice_id, amount, payment_method, reference, notes } = req.body;

    if (!invoice_id || amount == null || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'ID facture, montant et mode de paiement requis.'
      });
    }

    // Vérifier que l'utilisateur a une caisse ouverte
    const [activeRegister] = await db.query(
      'SELECT id FROM cash_registers WHERE cashier_id = ? AND status = "OPEN"',
      [req.user.id]
    );

    if (activeRegister.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez d\'abord ouvrir une caisse pour enregistrer un paiement.'
      });
    }

    const cash_register_id = activeRegister[0].id;

    // Récupérer la facture
    const [invoices] = await db.query(
      'SELECT * FROM invoices WHERE id = ?',
      [invoice_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée.'
      });
    }

    const invoice = invoices[0];

    // Calculer le total déjà payé
    const [payments] = await db.query(
      'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const totalPaid = parseFloat(payments[0].total_paid || 0);
    const newTotal = totalPaid + parseFloat(amount);
    const remaining = parseFloat(invoice.patient_responsibility);

    if (newTotal > remaining) {
      return res.status(400).json({
        success: false,
        message: 'Le montant total des paiements dépasse le montant dû.'
      });
    }

    // Générer le numéro de paiement
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const [todayPayments] = await db.query(
      'SELECT payment_number FROM payments WHERE payment_number LIKE ? ORDER BY payment_number DESC LIMIT 1',
      [`P${datePrefix}%`]
    );

    let counter = 1;
    if (todayPayments.length > 0) {
      const lastNumber = todayPayments[0].payment_number;
      counter = parseInt(lastNumber.slice(-4)) + 1;
    }

    const payment_number = `P${datePrefix}${String(counter).padStart(4, '0')}`;

    // Enregistrer le paiement
    await db.query(
      `INSERT INTO payments (
        invoice_id, cash_register_id, payment_number, payment_date, payment_time, amount, payment_method, reference_number, notes, received_by
      ) VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?)`,
      [invoice_id, cash_register_id, payment_number, amount, payment_method, reference || null, notes || null, req.user.id]
    );

    // Créer une transaction de comptabilité pour ce paiement (REVENU)
    const transactionNumber = `TRX-${Date.now()}`;
    await db.query(
      `INSERT INTO accounting_transactions (
        transaction_number, transaction_date, transaction_type, category,
        amount, payment_method, reference_type, reference_id, description, created_by
      ) VALUES (?, CURDATE(), 'INCOME', 'PAYMENT', ?, ?, 'PAYMENT', ?, ?, ?)`,
      [
        transactionNumber,
        amount,
        payment_method,
        invoice_id,
        `Paiement facture ${invoice.invoice_number} - ${payment_number}`,
        req.user.id
      ]
    );

    // Mettre à jour le statut de la facture
    let newStatus = 'PARTIAL';
    if (newTotal >= remaining) {
      newStatus = 'PAID';
    }

    await db.query(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [newStatus, invoice_id]
    );

    res.status(201).json({
      success: true,
      message: 'Paiement enregistré avec succès.',
      data: {
        payment_number,
        total_paid: newTotal,
        remaining: remaining - newTotal,
        status: newStatus
      }
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du paiement.',
      error: error.message
    });
  }
};
