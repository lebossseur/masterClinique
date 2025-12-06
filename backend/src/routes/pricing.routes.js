const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricing.controller');
const { auth } = require('../middleware/auth');

router.get('/prices', auth, pricingController.getAllPrices);
router.get('/prices/:serviceCode', auth, pricingController.getPriceByServiceCode);
router.post('/prices', auth, pricingController.createPrice);
router.put('/prices/:id', auth, pricingController.updatePrice);
router.get('/insurance-companies', auth, pricingController.getAllInsuranceCompanies);
router.get('/coverage-rate', auth, pricingController.getCoverageRate);
router.post('/calculate', auth, pricingController.calculatePricing);

module.exports = router;
