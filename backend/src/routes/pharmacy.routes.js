const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/products', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllProducts);
router.get('/products/low-stock', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getLowStockProducts);
router.get('/products/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getProductById);
router.post('/products', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createProduct);
router.put('/products/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.updateProduct);
router.get('/sales', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllSales);
router.post('/sales', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createSale);

module.exports = router;
