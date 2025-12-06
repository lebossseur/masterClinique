const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/companies', auth, insuranceController.getAllInsuranceCompanies);
router.get('/companies/:id', auth, insuranceController.getInsuranceCompanyById);
router.post('/companies', auth, authorize('ADMIN', 'SUPERVISOR', 'ASSURANCE'), insuranceController.createInsuranceCompany);
router.put('/companies/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'ASSURANCE'), insuranceController.updateInsuranceCompany);
router.post('/patient', auth, authorize('ADMIN', 'SUPERVISOR', 'ASSURANCE'), insuranceController.addPatientInsurance);
router.get('/patient/:patientId', auth, insuranceController.getPatientInsurance);
router.get('/report', auth, insuranceController.getInsuranceReport);

// Factures d'assurance
router.get('/invoices/available', auth, insuranceController.getAvailableInvoices);
router.post('/invoices/generate', auth, authorize('ADMIN', 'SUPERVISOR', 'ASSURANCE'), insuranceController.generateInsuranceInvoice);
router.get('/invoices', auth, insuranceController.getAllInsuranceInvoices);
router.get('/invoices/:id', auth, insuranceController.getInsuranceInvoiceById);
router.put('/invoices/:id/status', auth, authorize('ADMIN', 'SUPERVISOR', 'ASSURANCE'), insuranceController.updateInsuranceInvoiceStatus);

module.exports = router;
