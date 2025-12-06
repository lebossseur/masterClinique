import api from './api';

const invoiceService = {
  createInvoice: async (admissionId, invoiceType = 'TICKET') => {
    const response = await api.post('/invoices', {
      admission_id: admissionId,
      invoice_type: invoiceType
    });
    return response.data;
  },

  getAllInvoices: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  recordPayment: async (invoiceId, paymentData) => {
    const response = await api.post('/invoices/payment', {
      invoice_id: invoiceId,
      ...paymentData
    });
    return response.data;
  }
};

export default invoiceService;
