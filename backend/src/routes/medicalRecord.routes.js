const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { auth } = require('../middleware/auth');

// Routes pour les dossiers médicaux
router.get('/patients/:patientId/medical-record', auth, medicalRecordController.getMedicalRecord);
router.put('/patients/:patientId/medical-record', auth, medicalRecordController.updateMedicalRecord);

// Routes pour les consultations
router.get('/consultations/pending', auth, medicalRecordController.getPendingConsultations);
router.get('/consultations/all', auth, medicalRecordController.getAllConsultations);
router.get('/patients/:patientId/consultations', auth, medicalRecordController.getConsultations);
router.post('/patients/:patientId/consultations', auth, medicalRecordController.createConsultation);
router.get('/consultations/:consultationId', auth, medicalRecordController.getConsultation);
router.put('/consultations/:consultationId', auth, medicalRecordController.updateConsultation);
router.delete('/consultations/:consultationId', auth, medicalRecordController.deleteConsultation);

module.exports = router;
