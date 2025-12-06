const express = require('express');
const router = express.Router();
const healthCenterController = require('../controllers/healthcenter.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, healthCenterController.getHealthCenter);
router.put('/', auth, healthCenterController.updateHealthCenter);

module.exports = router;
