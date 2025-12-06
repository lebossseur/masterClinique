const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, patientController.getAllPatients);
router.get('/search', auth, patientController.searchPatients);
router.get('/:id', auth, patientController.getPatientById);
router.post('/', auth, patientController.createPatient); // Tous les utilisateurs authentifiés peuvent créer
router.put('/:id', auth, patientController.updatePatient); // Tous les utilisateurs authentifiés peuvent modifier
router.delete('/:id', auth, authorize('ADMIN', 'SUPERVISOR'), patientController.deletePatient);

module.exports = router;
