const express = require('express');
const router = express.Router();
const cashRegisterController = require('../controllers/cashRegister.controller');
const { auth } = require('../middleware/auth');

router.post('/open', auth, cashRegisterController.openCashRegister);
router.get('/active', auth, cashRegisterController.getActiveCashRegister);
router.get('/', auth, cashRegisterController.getAllCashRegisters);
router.get('/:id', auth, cashRegisterController.getCashRegisterById);
router.post('/:id/close', auth, cashRegisterController.closeCashRegister);

module.exports = router;
