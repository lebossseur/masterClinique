const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Master Clinique API is running' });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const admissionRoutes = require('./routes/admission.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const accountingRoutes = require('./routes/accounting.routes');
const pricingRoutes = require('./routes/pricing.routes');
const healthCenterRoutes = require('./routes/healthcenter.routes');
const doctorRoutes = require('./routes/doctor.routes');
const cashRegisterRoutes = require('./routes/cashRegister.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/health-center', healthCenterRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/cash-registers', cashRegisterRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
