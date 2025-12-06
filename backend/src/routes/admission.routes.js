const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, admissionController.getAllAdmissions);
router.get('/waiting', auth, admissionController.getWaitingAdmissions);
router.post('/', auth, admissionController.createAdmission);
router.put('/:id/status', auth, admissionController.updateAdmissionStatus);

module.exports = router;
