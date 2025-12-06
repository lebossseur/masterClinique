const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { auth } = require('../middleware/auth');

router.post('/', auth, invoiceController.createInvoice);
router.post('/payment', auth, invoiceController.recordPayment);
router.get('/', auth, invoiceController.getAllInvoices);
router.get('/:id', auth, invoiceController.getInvoiceById);
router.get('/:id/payments', auth, invoiceController.getInvoicePayments);

module.exports = router;
