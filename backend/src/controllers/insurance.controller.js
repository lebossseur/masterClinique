const db = require('../config/database');

exports.getAllInsuranceCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      'SELECT * FROM insurance_companies ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Get all insurance companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des compagnies d\'assurance.'
    });
  }
};

exports.getInsuranceCompanyById = async (req, res) => {
  try {
    const [companies] = await db.query(
      'SELECT * FROM insurance_companies WHERE id = ?',
      [req.params.id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Compagnie d\'assurance non trouvée.'
      });
    }

    res.json({
      success: true,
      data: companies[0]
    });
  } catch (error) {
    console.error('Get insurance company by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la compagnie d\'assurance.'
    });
  }
};

exports.createInsuranceCompany = async (req, res) => {
  try {
    const { name, code, contact_person, phone, email, address } = req.body;

    console.log('=== CREATE INSURANCE COMPANY ===');
    console.log('Request body:', req.body);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO insurance_companies (name, code, contact_person, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, code || null, contact_person || null, phone || null, email || null, address || null]
    );

    console.log('Insurance company created with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Compagnie d\'assurance créée avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('=== CREATE INSURANCE COMPANY ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la compagnie d\'assurance.',
      error: error.message
    });
  }
};

exports.updateInsuranceCompany = async (req, res) => {
  try {
    const { name, code, contact_person, phone, email, address, coverage_percentage, is_active } = req.body;

    await db.query(
      `UPDATE insurance_companies SET name = ?, code = ?, contact_person = ?,
       phone = ?, email = ?, address = ?, coverage_percentage = ?, is_active = ?
       WHERE id = ?`,
      [name, code, contact_person, phone, email, address, coverage_percentage, is_active, req.params.id]
    );

    res.json({
      success: true,
      message: 'Compagnie d\'assurance mise à jour avec succès.'
    });
  } catch (error) {
    console.error('Update insurance company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la compagnie d\'assurance.'
    });
  }
};

exports.addPatientInsurance = async (req, res) => {
  try {
    const {
      patient_id, insurance_company_id, policy_number,
      coverage_percentage, start_date, end_date, notes
    } = req.body;

    console.log('=== ADD PATIENT INSURANCE ===');
    console.log('Request body:', req.body);

    if (!patient_id || !insurance_company_id || !policy_number || !coverage_percentage) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, compagnie d\'assurance, numéro de police et taux de couverture sont requis.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO patient_insurance (patient_id, insurance_company_id, policy_number,
       coverage_percentage, start_date, end_date, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
      [patient_id, insurance_company_id, policy_number, coverage_percentage,
       start_date || new Date(), end_date || null, notes || null]
    );

    console.log('Patient insurance added with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Assurance patient ajoutée avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('=== ADD PATIENT INSURANCE ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'assurance patient.',
      error: error.message
    });
  }
};

exports.getPatientInsurance = async (req, res) => {
  try {
    const [insurance] = await db.query(
      `SELECT pi.*, ic.name as company_name, ic.code as company_code
       FROM patient_insurance pi
       JOIN insurance_companies ic ON pi.insurance_company_id = ic.id
       WHERE pi.patient_id = ? AND pi.is_active = true
       ORDER BY pi.created_at DESC`,
      [req.params.patientId]
    );

    res.json({
      success: true,
      data: insurance
    });
  } catch (error) {
    console.error('Get patient insurance error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'assurance patient.'
    });
  }
};

// Rapport des actes et coûts par compagnie d'assurance
exports.getInsuranceReport = async (req, res) => {
  try {
    console.log('=== GET INSURANCE REPORT ===');

    const { start_date, end_date } = req.query;
    console.log('Filters:', { start_date, end_date });

    // Construire la requête avec filtres optionnels
    let whereConditions = ['a.has_insurance = 1', 'a.is_control = 0'];
    let queryParams = [];

    if (start_date) {
      whereConditions.push('i.invoice_date >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('i.invoice_date <= ?');
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // Récupérer toutes les factures avec assurance
    const [invoices] = await db.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.invoice_date,
        i.total_amount,
        i.insurance_covered,
        i.patient_responsibility,
        a.insurance_company_id,
        a.coverage_percentage,
        ic.name as insurance_company_name,
        ic.code as insurance_company_code,
        p.first_name,
        p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_number,
        (SELECT pi.policy_number
         FROM patient_insurance pi
         WHERE pi.patient_id = p.id
         AND pi.insurance_company_id = a.insurance_company_id
         AND pi.is_active = true
         LIMIT 1) as insurance_policy_number
      FROM invoices i
      JOIN admissions a ON i.admission_id = a.id
      JOIN insurance_companies ic ON a.insurance_company_id = ic.id
      JOIN patients p ON i.patient_id = p.id
      WHERE ${whereClause}
      ORDER BY ic.name, i.invoice_date DESC
    `, queryParams);

    // Récupérer les actes médicaux par facture (avec mêmes filtres)
    const [services] = await db.query(`
      SELECT
        asv.admission_id,
        asv.service_code,
        asv.service_name,
        asv.base_price,
        asv.insurance_covered,
        asv.patient_pays,
        a.insurance_company_id,
        i.id as invoice_id
      FROM admission_services asv
      JOIN admissions a ON asv.admission_id = a.id
      JOIN invoices i ON i.admission_id = a.id
      WHERE ${whereClause}
      ORDER BY asv.service_name
    `, queryParams);

    // Créer un mapping des actes médicaux par facture
    const servicesByInvoice = {};
    services.forEach(service => {
      if (!servicesByInvoice[service.invoice_id]) {
        servicesByInvoice[service.invoice_id] = [];
      }
      servicesByInvoice[service.invoice_id].push(service.service_name);
    });

    // Regrouper par compagnie d'assurance
    const reportByCompany = {};

    invoices.forEach(invoice => {
      const companyId = invoice.insurance_company_id;

      if (!reportByCompany[companyId]) {
        reportByCompany[companyId] = {
          company_id: companyId,
          company_name: invoice.insurance_company_name,
          company_code: invoice.insurance_company_code,
          total_invoices: 0,
          total_amount: 0,
          total_insurance_covered: 0,
          total_patient_responsibility: 0,
          invoices: [],
          services_summary: {}
        };
      }

      // Ajouter les actes médicaux à la facture
      invoice.medical_services = servicesByInvoice[invoice.id] || [];

      reportByCompany[companyId].total_invoices++;
      reportByCompany[companyId].total_amount += parseFloat(invoice.total_amount);
      reportByCompany[companyId].total_insurance_covered += parseFloat(invoice.insurance_covered);
      reportByCompany[companyId].total_patient_responsibility += parseFloat(invoice.patient_responsibility);
      reportByCompany[companyId].invoices.push(invoice);
    });

    // Ajouter le résumé des services par compagnie
    services.forEach(service => {
      const companyId = service.insurance_company_id;

      if (reportByCompany[companyId]) {
        const serviceName = service.service_name;

        if (!reportByCompany[companyId].services_summary[serviceName]) {
          reportByCompany[companyId].services_summary[serviceName] = {
            service_code: service.service_code,
            service_name: serviceName,
            count: 0,
            total_base_price: 0,
            total_insurance_covered: 0,
            total_patient_pays: 0
          };
        }

        reportByCompany[companyId].services_summary[serviceName].count++;
        reportByCompany[companyId].services_summary[serviceName].total_base_price += parseFloat(service.base_price);
        reportByCompany[companyId].services_summary[serviceName].total_insurance_covered += parseFloat(service.insurance_covered);
        reportByCompany[companyId].services_summary[serviceName].total_patient_pays += parseFloat(service.patient_pays);
      }
    });

    // Convertir les objets en tableaux
    const report = Object.values(reportByCompany).map(company => ({
      ...company,
      services_summary: Object.values(company.services_summary)
    }));

    // Statistiques globales
    const globalStats = {
      total_companies: report.length,
      total_invoices: invoices.length,
      total_amount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0),
      total_insurance_covered: invoices.reduce((sum, inv) => sum + parseFloat(inv.insurance_covered), 0),
      total_patient_responsibility: invoices.reduce((sum, inv) => sum + parseFloat(inv.patient_responsibility), 0)
    };

    console.log('Report generated:', {
      companies: report.length,
      invoices: invoices.length
    });

    res.json({
      success: true,
      data: {
        companies: report,
        global_stats: globalStats
      }
    });
  } catch (error) {
    console.error('=== GET INSURANCE REPORT ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport d\'assurance.',
      error: error.message
    });
  }
};

// Récupérer les factures patients disponibles pour une compagnie
exports.getAvailableInvoices = async (req, res) => {
  try {
    const { insurance_company_id, period_start, period_end } = req.query;

    console.log('=== GET AVAILABLE INVOICES ===');
    console.log('Query:', { insurance_company_id, period_start, period_end });

    if (!insurance_company_id) {
      return res.status(400).json({
        success: false,
        message: 'Compagnie d\'assurance requise.'
      });
    }

    let query = `
      SELECT
        i.id,
        i.invoice_number,
        i.invoice_date,
        i.total_amount,
        i.insurance_covered,
        i.patient_responsibility,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.first_name,
        p.last_name,
        p.patient_number,
        pi.policy_number as insurance_policy_number,
        a.coverage_percentage,
        GROUP_CONCAT(asv.service_name SEPARATOR ', ') as medical_services
      FROM invoices i
      JOIN admissions a ON i.admission_id = a.id
      JOIN patients p ON i.patient_id = p.id
      LEFT JOIN patient_insurance pi ON pi.patient_id = p.id
        AND pi.insurance_company_id = a.insurance_company_id
        AND pi.is_active = true
      LEFT JOIN admission_services asv ON asv.admission_id = a.id
      WHERE a.insurance_company_id = ?
      AND a.has_insurance = 1
      AND a.is_control = 0
      AND i.insurance_covered > 0
      AND i.id NOT IN (
        SELECT patient_invoice_id FROM insurance_invoice_items
      )`;

    const params = [insurance_company_id];

    if (period_start) {
      query += ' AND i.invoice_date >= ?';
      params.push(period_start);
    }

    if (period_end) {
      query += ' AND i.invoice_date <= ?';
      params.push(period_end);
    }

    query += ' GROUP BY i.id, p.id, a.id, pi.id ORDER BY i.invoice_date DESC';

    const [invoices] = await db.query(query, params);

    console.log('Available invoices found:', invoices.length);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('=== GET AVAILABLE INVOICES ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures disponibles.',
      error: error.message
    });
  }
};

// Générer une facture d'assurance avec les factures sélectionnées
exports.generateInsuranceInvoice = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { insurance_company_id, period_start, period_end, selected_invoice_ids } = req.body;
    const userId = req.user.id;

    console.log('=== GENERATE INSURANCE INVOICE ===');
    console.log('Request:', { insurance_company_id, period_start, period_end, selected_invoice_ids, userId });

    if (!insurance_company_id || !period_start || !period_end || !selected_invoice_ids || selected_invoice_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Compagnie d\'assurance, période et factures sélectionnées requises.'
      });
    }

    // Récupérer les factures sélectionnées
    const placeholders = selected_invoice_ids.map(() => '?').join(',');
    const [patientInvoices] = await connection.query(
      `SELECT
        i.id,
        i.invoice_number,
        i.invoice_date,
        i.insurance_covered,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_number
       FROM invoices i
       JOIN admissions a ON i.admission_id = a.id
       JOIN patients p ON i.patient_id = p.id
       WHERE i.id IN (${placeholders})
       AND a.insurance_company_id = ?
       AND a.has_insurance = 1
       AND a.is_control = 0
       AND i.insurance_covered > 0
       ORDER BY i.invoice_date`,
      [...selected_invoice_ids, insurance_company_id]
    );

    if (patientInvoices.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Aucune facture valide trouvée.'
      });
    }

    // Calculer le montant total
    const totalAmount = patientInvoices.reduce((sum, inv) => sum + parseFloat(inv.insurance_covered), 0);

    // Générer le numéro de facture d'assurance
    const invoiceDate = new Date();
    const year = invoiceDate.getFullYear();
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');

    const [lastInvoice] = await connection.query(
      `SELECT invoice_number FROM insurance_invoices
       WHERE invoice_number LIKE ?
       ORDER BY id DESC LIMIT 1`,
      [`INS-${year}${month}-%`]
    );

    let invoiceNumber;
    if (lastInvoice.length > 0) {
      const lastNum = parseInt(lastInvoice[0].invoice_number.split('-')[2]);
      invoiceNumber = `INS-${year}${month}-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      invoiceNumber = `INS-${year}${month}-0001`;
    }

    // Créer la facture d'assurance
    const [result] = await connection.query(
      `INSERT INTO insurance_invoices
       (invoice_number, insurance_company_id, invoice_date, period_start, period_end,
        total_amount, total_invoices, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
      [invoiceNumber, insurance_company_id, invoiceDate, period_start, period_end,
       totalAmount, patientInvoices.length, userId]
    );

    const insuranceInvoiceId = result.insertId;

    // Ajouter les items (factures patients)
    for (const invoice of patientInvoices) {
      await connection.query(
        `INSERT INTO insurance_invoice_items
         (insurance_invoice_id, patient_invoice_id, amount)
         VALUES (?, ?, ?)`,
        [insuranceInvoiceId, invoice.id, invoice.insurance_covered]
      );
    }

    await connection.commit();

    console.log('Insurance invoice created:', invoiceNumber);

    res.status(201).json({
      success: true,
      message: 'Facture d\'assurance créée avec succès.',
      data: {
        id: insuranceInvoiceId,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        total_invoices: patientInvoices.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('=== GENERATE INSURANCE INVOICE ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la facture d\'assurance.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Récupérer toutes les factures d'assurance
exports.getAllInsuranceInvoices = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT
        ii.*,
        ic.name as company_name,
        ic.code as company_code,
        u.username as created_by_name
       FROM insurance_invoices ii
       JOIN insurance_companies ic ON ii.insurance_company_id = ic.id
       LEFT JOIN users u ON ii.created_by = u.id
       ORDER BY ii.invoice_date DESC, ii.id DESC`
    );

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get insurance invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures d\'assurance.'
    });
  }
};

// Récupérer les détails d'une facture d'assurance
exports.getInsuranceInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la facture d'assurance
    const [invoices] = await db.query(
      `SELECT
        ii.*,
        ic.name as company_name,
        ic.code as company_code,
        ic.contact_person,
        ic.phone,
        ic.email,
        ic.address,
        u.username as created_by_name
       FROM insurance_invoices ii
       JOIN insurance_companies ic ON ii.insurance_company_id = ic.id
       LEFT JOIN users u ON ii.created_by = u.id
       WHERE ii.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture d\'assurance non trouvée.'
      });
    }

    const invoice = invoices[0];

    // Récupérer les items (factures patients)
    const [items] = await db.query(
      `SELECT
        iii.*,
        i.invoice_number as patient_invoice_number,
        i.invoice_date,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_number,
        pi.policy_number as insurance_policy_number,
        a.coverage_percentage,
        GROUP_CONCAT(asv.service_name SEPARATOR ', ') as medical_services
       FROM insurance_invoice_items iii
       JOIN invoices i ON iii.patient_invoice_id = i.id
       JOIN patients p ON i.patient_id = p.id
       JOIN admissions a ON i.admission_id = a.id
       LEFT JOIN patient_insurance pi ON pi.patient_id = p.id
         AND pi.insurance_company_id = a.insurance_company_id
         AND pi.is_active = true
       LEFT JOIN admission_services asv ON asv.admission_id = a.id
       WHERE iii.insurance_invoice_id = ?
       GROUP BY iii.id, i.id, p.id, a.id, pi.id
       ORDER BY i.invoice_date`,
      [id]
    );

    invoice.items = items;

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get insurance invoice by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture d\'assurance.'
    });
  }
};

// Mettre à jour le statut d'une facture d'assurance
exports.updateInsuranceInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['DRAFT', 'SENT', 'PAID', 'PARTIAL'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide.'
      });
    }

    await db.query(
      `UPDATE insurance_invoices
       SET status = ?, notes = ?
       WHERE id = ?`,
      [status, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update insurance invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.'
    });
  }
};
