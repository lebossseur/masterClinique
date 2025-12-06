const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accounting.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/transactions', auth, authorize('ADMIN', 'SUPERVISOR'), accountingController.getAllTransactions);
router.get('/dashboard', auth, authorize('ADMIN', 'SUPERVISOR'), accountingController.getDashboardStats);
router.get('/expenses', auth, authorize('ADMIN', 'SUPERVISOR'), accountingController.getAllExpenses);
router.post('/expenses', auth, authorize('ADMIN', 'SUPERVISOR'), accountingController.createExpense);
router.put('/expenses/:id/approve', auth, authorize('ADMIN', 'SUPERVISOR'), accountingController.approveExpense);

module.exports = router;
