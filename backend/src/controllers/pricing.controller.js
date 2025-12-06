const db = require('../config/database');

// Récupérer tous les tarifs des actes médicaux
exports.getAllPrices = async (req, res) => {
  try {
    const [prices] = await db.query(
      'SELECT * FROM medical_service_prices WHERE is_active = true ORDER BY service_name'
    );

    res.json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error('Get all prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tarifs.'
    });
  }
};

// Récupérer le tarif d'un acte spécifique
exports.getPriceByServiceCode = async (req, res) => {
  try {
    const [prices] = await db.query(
      'SELECT * FROM medical_service_prices WHERE service_code = ? AND is_active = true',
      [req.params.serviceCode]
    );

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarif non trouvé.'
      });
    }

    res.json({
      success: true,
      data: prices[0]
    });
  } catch (error) {
    console.error('Get price by service code error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du tarif.'
    });
  }
};

// Récupérer toutes les compagnies d'assurance
exports.getAllInsuranceCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      'SELECT * FROM insurance_companies WHERE is_active = true ORDER BY name'
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

// Calculer le prix avec assurance
exports.calculatePricing = async (req, res) => {
  try {
    const { service_code, coverage_rate } = req.body;

    if (!service_code) {
      return res.status(400).json({
        success: false,
        message: 'Le code du service est requis.'
      });
    }

    // Récupérer le prix de base
    const [prices] = await db.query(
      'SELECT * FROM medical_service_prices WHERE service_code = ? AND is_active = true',
      [service_code]
    );

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé.'
      });
    }

    const basePrice = parseFloat(prices[0].base_price);
    const rate = coverage_rate ? parseFloat(coverage_rate) : 0;
    const insuranceAmount = (basePrice * rate) / 100;
    const patientAmount = basePrice - insuranceAmount;

    res.json({
      success: true,
      data: {
        service_code: service_code,
        service_name: prices[0].service_name,
        base_price: basePrice,
        coverage_rate: rate,
        insurance_amount: insuranceAmount,
        patient_amount: patientAmount
      }
    });
  } catch (error) {
    console.error('Calculate pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des tarifs.'
    });
  }
};

// Récupérer le taux de couverture spécifique pour une compagnie et un service
exports.getCoverageRate = async (req, res) => {
  try {
    const { insurance_company_id, service_code } = req.query;

    if (!insurance_company_id || !service_code) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la compagnie d\'assurance et le code du service sont requis.'
      });
    }

    // Chercher le taux de couverture spécifique
    const [coverageRates] = await db.query(
      'SELECT coverage_rate FROM insurance_coverage_rates WHERE insurance_company_id = ? AND service_code = ?',
      [insurance_company_id, service_code]
    );

    let coverageRate = 0;

    if (coverageRates.length > 0) {
      // Utiliser le taux spécifique
      coverageRate = parseFloat(coverageRates[0].coverage_rate);
    } else {
      // Utiliser le taux par défaut de la compagnie
      const [companies] = await db.query(
        'SELECT coverage_percentage FROM insurance_companies WHERE id = ? AND is_active = true',
        [insurance_company_id]
      );

      if (companies.length > 0) {
        coverageRate = parseFloat(companies[0].coverage_percentage);
      }
    }

    res.json({
      success: true,
      data: {
        coverage_rate: coverageRate
      }
    });
  } catch (error) {
    console.error('Get coverage rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du taux de couverture.'
    });
  }
};

// Créer un nouvel acte médical
exports.createPrice = async (req, res) => {
  try {
    const { service_code, service_name, base_price, description, is_active } = req.body;

    if (!service_code || !service_name || !base_price) {
      return res.status(400).json({
        success: false,
        message: 'Le code, le nom et le prix de l\'acte sont requis.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO medical_service_prices (service_code, service_name, base_price, description, is_active) VALUES (?, ?, ?, ?, ?)',
      [service_code, service_name, base_price, description || null, is_active !== false]
    );

    res.status(201).json({
      success: true,
      message: 'Acte médical créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create price error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Un acte avec ce code existe déjà.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'acte médical.'
    });
  }
};

// Mettre à jour un acte médical
exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, base_price, description, is_active } = req.body;

    if (!service_name || !base_price) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le prix de l\'acte sont requis.'
      });
    }

    await db.query(
      'UPDATE medical_service_prices SET service_name = ?, base_price = ?, description = ?, is_active = ? WHERE id = ?',
      [service_name, base_price, description || null, is_active !== false, id]
    );

    res.json({
      success: true,
      message: 'Acte médical mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'acte médical.'
    });
  }
};
