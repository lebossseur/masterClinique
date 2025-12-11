const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { auth, authorize } = require('../middleware/auth');

// Produits
router.get('/products', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllProducts);
router.get('/products/low-stock', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getLowStockProducts);
router.get('/products/expired', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getExpiredProducts);
router.get('/products/out-of-stock', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getOutOfStockProducts);
router.get('/products/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getProductById);
router.post('/products', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createProduct);
router.put('/products/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.updateProduct);

// Entrées de stock (achats, commandes, dons)
router.get('/stock-entries', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllStockEntries);
router.get('/stock-entries/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getStockEntryById);
router.post('/stock-entries', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createStockEntry);

// Sorties de stock (ventes, périmés, dons)
router.get('/stock-exits', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllStockExits);
router.get('/stock-exits/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getStockExitById);
router.post('/stock-exits', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createStockExit);

// Mouvements de stock
router.get('/stock-movements', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getStockMovements);

// Fournisseurs
router.get('/suppliers', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllSuppliers);
router.post('/suppliers', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createSupplier);

// Données de référence
router.get('/categories', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getCategories);
router.get('/medication-types', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getMedicationTypes);
router.get('/storage-types', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getStorageTypes);
router.get('/packaging-types', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getPackagingTypes);

// Ventes (pour compatibilité)
router.get('/sales', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getAllSales);
router.post('/sales', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.createSale);

// Rapports de ventes
router.get('/sales-report', auth, authorize('ADMIN', 'SUPERVISOR', 'PHARMACIE'), pharmacyController.getSalesReport);

module.exports = router;
