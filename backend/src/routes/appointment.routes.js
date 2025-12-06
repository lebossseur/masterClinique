const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, appointmentController.getAllAppointments);
router.get('/today', auth, appointmentController.getTodayAppointments);
router.get('/:id', auth, appointmentController.getAppointmentById);
router.post('/', auth, authorize('ADMIN', 'SUPERVISOR', 'ACCUEIL'), appointmentController.createAppointment);
router.put('/:id', auth, authorize('ADMIN', 'SUPERVISOR', 'ACCUEIL'), appointmentController.updateAppointment);
router.delete('/:id', auth, authorize('ADMIN', 'SUPERVISOR'), appointmentController.deleteAppointment);

module.exports = router;
