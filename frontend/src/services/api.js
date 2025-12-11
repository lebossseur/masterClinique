import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Patients
export const patientService = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  search: (query) => api.get(`/patients/search?query=${query}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};

// Appointments
export const appointmentService = {
  getAll: () => api.get('/appointments'),
  getToday: () => api.get('/appointments/today'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

// Admissions
export const admissionService = {
  getAll: () => api.get('/admissions'),
  getWaiting: () => api.get('/admissions/waiting'),
  create: (data) => api.post('/admissions', data),
  updateStatus: (id, status) => api.put(`/admissions/${id}/status`, { status })
};

// Pricing
export const pricingService = {
  getAllPrices: () => api.get('/pricing/prices'),
  getPriceByServiceCode: (serviceCode) => api.get(`/pricing/prices/${serviceCode}`),
  createPrice: (data) => api.post('/pricing/prices', data),
  updatePrice: (id, data) => api.put(`/pricing/prices/${id}`, data),
  getAllInsuranceCompanies: () => api.get('/pricing/insurance-companies'),
  getCoverageRate: (insuranceCompanyId, serviceCode) => api.get(`/pricing/coverage-rate?insurance_company_id=${insuranceCompanyId}&service_code=${serviceCode}`),
  calculatePricing: (data) => api.post('/pricing/calculate', data)
};

// Invoices
export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  createPayment: (data) => api.post('/invoices/payments', data)
};

// Insurance
export const insuranceService = {
  getAllCompanies: () => api.get('/insurance/companies'),
  getCompanyById: (id) => api.get(`/insurance/companies/${id}`),
  createCompany: (data) => api.post('/insurance/companies', data),
  updateCompany: (id, data) => api.put(`/insurance/companies/${id}`, data),
  addPatientInsurance: (data) => api.post('/insurance/patient', data),
  getPatientInsurance: (patientId) => api.get(`/insurance/patient/${patientId}`),
  getReport: (params = '') => api.get(`/insurance/report${params}`),
  getAvailableInvoices: (params) => api.get('/insurance/invoices/available', { params }),
  generateInvoice: (data) => api.post('/insurance/invoices/generate', data),
  getAllInvoices: () => api.get('/insurance/invoices'),
  getInvoiceById: (id) => api.get(`/insurance/invoices/${id}`),
  updateInvoiceStatus: (id, data) => api.put(`/insurance/invoices/${id}/status`, data)
};

// Pharmacy
export const pharmacyService = {
  // Produits
  getAllProducts: () => api.get('/pharmacy/products'),
  getLowStock: () => api.get('/pharmacy/products/low-stock'),
  getExpiredProducts: () => api.get('/pharmacy/products/expired'),
  getOutOfStock: () => api.get('/pharmacy/products/out-of-stock'),
  getProductById: (id) => api.get(`/pharmacy/products/${id}`),
  createProduct: (data) => api.post('/pharmacy/products', data),
  updateProduct: (id, data) => api.put(`/pharmacy/products/${id}`, data),

  // Entrées de stock
  getAllStockEntries: () => api.get('/pharmacy/stock-entries'),
  getStockEntryById: (id) => api.get(`/pharmacy/stock-entries/${id}`),
  createStockEntry: (data) => api.post('/pharmacy/stock-entries', data),

  // Sorties de stock
  getAllStockExits: () => api.get('/pharmacy/stock-exits'),
  getStockExitById: (id) => api.get(`/pharmacy/stock-exits/${id}`),
  createStockExit: (data) => api.post('/pharmacy/stock-exits', data),

  // Mouvements de stock
  getStockMovements: (params) => api.get('/pharmacy/stock-movements', { params }),

  // Fournisseurs
  getAllSuppliers: () => api.get('/pharmacy/suppliers'),
  createSupplier: (data) => api.post('/pharmacy/suppliers', data),

  // Données de référence
  getCategories: () => api.get('/pharmacy/categories'),
  getMedicationTypes: () => api.get('/pharmacy/medication-types'),
  getStorageTypes: () => api.get('/pharmacy/storage-types'),
  getPackagingTypes: () => api.get('/pharmacy/packaging-types'),

  // Ventes (pour compatibilité)
  getAllSales: () => api.get('/pharmacy/sales'),
  createSale: (data) => api.post('/pharmacy/sales', data),

  // Rapports de ventes
  getSalesReport: (startDate, endDate) => api.get('/pharmacy/sales-report', {
    params: { start_date: startDate, end_date: endDate }
  })
};

// Accounting
export const accountingService = {
  getTransactions: () => api.get('/accounting/transactions'),
  getDashboard: () => api.get('/accounting/dashboard'),
  getAllExpenses: () => api.get('/accounting/expenses'),
  createExpense: (data) => api.post('/accounting/expenses', data),
  approveExpense: (id) => api.put(`/accounting/expenses/${id}/approve`)
};

// Users
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getRoles: () => api.get('/users/roles'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Health Center
export const healthCenterService = {
  get: () => api.get('/health-center'),
  update: (data) => api.put('/health-center', data)
};

// Doctors
export const doctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
};

// Medical Records
export const medicalRecordService = {
  getMedicalRecord: (patientId) => api.get(`/medical-records/patients/${patientId}/medical-record`),
  updateMedicalRecord: (patientId, data) => api.put(`/medical-records/patients/${patientId}/medical-record`, data),
  getConsultations: (patientId) => api.get(`/medical-records/patients/${patientId}/consultations`),
  getPendingConsultations: () => api.get(`/medical-records/consultations/pending`),
  getAllConsultations: () => api.get(`/medical-records/consultations/all`),
  createConsultation: (patientId, data) => api.post(`/medical-records/patients/${patientId}/consultations`, data),
  getConsultation: (consultationId) => api.get(`/medical-records/consultations/${consultationId}`),
  updateConsultation: (consultationId, data) => api.put(`/medical-records/consultations/${consultationId}`, data),
  deleteConsultation: (consultationId) => api.delete(`/medical-records/consultations/${consultationId}`)
};

export default api;
