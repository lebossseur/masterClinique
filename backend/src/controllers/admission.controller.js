const db = require('../config/database');

exports.createAdmission = async (req, res) => {
  try {
    console.log('=== CREATE ADMISSION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      patient_id,
      vitals,
      has_insurance,
      insurance_company_id,
      insurance_number,
      consultation_type,
      consultation_reason,
      services,
      total_base,
      total_insurance_covered,
      total_patient_pays
    } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID est requis.'
      });
    }

    // Si on a des services multiples, utiliser les totaux fournis
    let basePrice = 0;
    let coveragePercentage = 0;
    let insuranceAmount = 0;
    let patientAmount = 0;

    if (services && services.length > 0) {
      // Utiliser les totaux précalculés du frontend
      basePrice = total_base || 0;
      insuranceAmount = total_insurance_covered || 0;
      // IMPORTANT: Ne pas utiliser || car 0 est une valeur valide (assurance à 100%)
      patientAmount = total_patient_pays !== undefined && total_patient_pays !== null ? total_patient_pays : basePrice;

      // Calculer le pourcentage moyen de couverture
      if (basePrice > 0) {
        coveragePercentage = (insuranceAmount / basePrice) * 100;
      }
    } else if (consultation_type) {
      // Ancien système : un seul acte
      // Récupérer le prix de base de l'acte
      const [prices] = await db.query(
        'SELECT base_price FROM medical_service_prices WHERE service_code = ? AND is_active = true',
        [consultation_type]
      );

      basePrice = prices.length > 0 ? parseFloat(prices[0].base_price) : 0;
      patientAmount = basePrice;

      // Si le patient a une assurance, calculer la couverture
      if (has_insurance && insurance_company_id) {
        // Chercher le taux de couverture spécifique (correction du nom de colonne)
        const [coverageRates] = await db.query(
          'SELECT coverage_rate FROM insurance_coverage_rates WHERE insurance_company_id = ? AND service_code = ?',
          [insurance_company_id, consultation_type]
        );

        if (coverageRates.length > 0) {
          coveragePercentage = parseFloat(coverageRates[0].coverage_rate);
        } else {
          // Utiliser le taux par défaut de la compagnie
          const [companies] = await db.query(
            'SELECT coverage_percentage FROM insurance_companies WHERE id = ? AND is_active = true',
            [insurance_company_id]
          );

          if (companies.length > 0) {
            coveragePercentage = parseFloat(companies[0].coverage_percentage);
          }
        }

        // Calculer les montants
        insuranceAmount = (basePrice * coveragePercentage) / 100;
        patientAmount = basePrice - insuranceAmount;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Au moins un acte médical est requis.'
      });
    }

    // Générer un numéro d'admission
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const [todayAdmissions] = await db.query(
      'SELECT admission_number FROM admissions WHERE admission_number LIKE ? ORDER BY admission_number DESC LIMIT 1',
      [`A${datePrefix}%`]
    );

    let counter = 1;
    if (todayAdmissions.length > 0) {
      const lastNumber = todayAdmissions[0].admission_number;
      counter = parseInt(lastNumber.slice(-3)) + 1;
    }

    const admission_number = `A${datePrefix}${String(counter).padStart(3, '0')}`;
    console.log('Generated admission number:', admission_number);

    // Vérifier si c'est un contrôle (retour dans les 15 jours pour le(s) même(s) acte(s))
    let isControl = false;
    let originalAdmissionId = null;
    let controlValidUntil = null;

    if (services && services.length > 0) {
      // Vérifier pour chaque service si le patient a déjà fait cet acte dans les 15 derniers jours
      const serviceCodes = services.map(s => s.service_code);

      const [recentAdmissions] = await db.query(
        `SELECT DISTINCT a.id, a.created_at, a.admission_number
         FROM admissions a
         JOIN admission_services asv ON a.id = asv.admission_id
         WHERE a.patient_id = ?
           AND asv.service_code IN (?)
           AND a.created_at >= DATE_SUB(NOW(), INTERVAL 15 DAY)
           AND a.status != 'CANCELLED'
           AND (a.is_control = 0 OR a.is_control IS NULL)
         ORDER BY a.created_at DESC
         LIMIT 1`,
        [patient_id, serviceCodes]
      );

      if (recentAdmissions.length > 0) {
        isControl = true;
        originalAdmissionId = recentAdmissions[0].id;
        const originalDate = new Date(recentAdmissions[0].created_at);
        controlValidUntil = new Date(originalDate);
        controlValidUntil.setDate(controlValidUntil.getDate() + 15);

        console.log(`CONTRÔLE DÉTECTÉ: Patient revient pour le même acte dans les 15 jours. Admission originale: ${recentAdmissions[0].admission_number}`);

        // Remettre les montants à zéro pour un contrôle gratuit
        basePrice = 0;
        insuranceAmount = 0;
        patientAmount = 0;
      }
    }

    // Insérer l'admission
    const [result] = await db.query(
      `INSERT INTO admissions (
        admission_number, patient_id, consultation_type, consultation_reason,
        has_insurance, insurance_company_id, insurance_number,
        base_price, coverage_percentage, insurance_amount, patient_amount,
        is_control, original_admission_id, control_valid_until,
        status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WAITING_BILLING', ?, NOW())`,
      [
        admission_number,
        patient_id,
        consultation_type,
        consultation_reason || null,
        has_insurance ? 1 : 0,
        insurance_company_id || null,
        insurance_number || null,
        basePrice,
        coveragePercentage,
        insuranceAmount,
        patientAmount,
        isControl ? 1 : 0,
        originalAdmissionId,
        controlValidUntil,
        req.user.id
      ]
    );

    const admission_id = result.insertId;
    console.log('Admission created with ID:', admission_id);

    // Insérer les actes médicaux dans la table admission_services
    if (services && services.length > 0) {
      for (const service of services) {
        await db.query(
          `INSERT INTO admission_services (
            admission_id, service_code, service_name, base_price, insurance_covered, patient_pays, is_free_control
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            admission_id,
            service.service_code,
            service.service_name,
            isControl ? 0 : service.base_price,  // Prix à 0 si contrôle
            isControl ? 0 : (service.insurance_covered || 0),  // Assurance à 0 si contrôle
            isControl ? 0 : service.patient_pays,  // Patient paie 0 si contrôle
            isControl ? 1 : 0  // Marquer comme contrôle gratuit
          ]
        );
      }
      console.log(`${services.length} service(s) saved for admission ${admission_id}${isControl ? ' (CONTRÔLE GRATUIT)' : ''}`);
    }

    // Insérer les constantes vitales si fournies
    if (vitals) {
      await db.query(
        `INSERT INTO patient_vitals (
          admission_id, patient_id, temperature, blood_pressure_systolic,
          blood_pressure_diastolic, heart_rate, weight, height, blood_sugar, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          admission_id,
          patient_id,
          vitals.temperature || null,
          vitals.blood_pressure_systolic || null,
          vitals.blood_pressure_diastolic || null,
          vitals.heart_rate || null,
          vitals.weight || null,
          vitals.height || null,
          vitals.blood_sugar || null,
          vitals.notes || null
        ]
      );
      console.log('Vitals saved successfully');
    }

    res.status(201).json({
      success: true,
      message: 'Admission créée avec succès.',
      data: {
        id: admission_id,
        admission_number: admission_number
      }
    });

    console.log('=== CREATE ADMISSION SUCCESS ===');
  } catch (error) {
    console.error('=== CREATE ADMISSION ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'admission.',
      error: error.message
    });
  }
};

exports.getWaitingAdmissions = async (req, res) => {
  try {
    const [admissions] = await db.query(
      `SELECT
        a.id, a.admission_number, a.created_at as admission_date, a.consultation_type, a.consultation_reason,
        a.has_insurance, a.status, a.created_at,
        a.base_price, a.coverage_percentage, a.insurance_amount, a.patient_amount,
        a.is_control, a.original_admission_id, a.control_valid_until,
        CONCAT(p.last_name, ' ', p.first_name) as patient_name,
        p.patient_number, p.phone as patient_phone,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        ic.name as insurance_company_name, a.insurance_number,
        v.temperature, v.blood_pressure_systolic, v.blood_pressure_diastolic,
        v.heart_rate, v.weight, v.height, v.blood_sugar
       FROM admissions a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN insurance_companies ic ON a.insurance_company_id = ic.id
       LEFT JOIN patient_vitals v ON a.id = v.admission_id
       WHERE a.status = 'WAITING_BILLING'
       ORDER BY a.created_at ASC`
    );

    // Récupérer les services pour chaque admission
    for (let admission of admissions) {
      const [services] = await db.query(
        `SELECT service_code, service_name, base_price, insurance_covered, patient_pays
         FROM admission_services
         WHERE admission_id = ?`,
        [admission.id]
      );
      admission.services = services;
    }

    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    console.error('Get waiting admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des admissions en attente.'
    });
  }
};

exports.getAllAdmissions = async (req, res) => {
  try {
    const [admissions] = await db.query(
      `SELECT
        a.id, a.admission_number, a.consultation_type, a.consultation_reason,
        a.has_insurance, a.status, a.created_at,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_number,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM admissions a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    console.error('Get all admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des admissions.'
    });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      'UPDATE admissions SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: 'Statut de l\'admission mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update admission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.'
    });
  }
};
