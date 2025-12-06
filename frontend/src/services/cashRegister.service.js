import api from './api';

const cashRegisterService = {
  openCashRegister: async (openingAmount, notes) => {
    const response = await api.post('/cash-registers/open', {
      opening_amount: openingAmount,
      notes
    });
    return response.data;
  },

  getActiveCashRegister: async () => {
    const response = await api.get('/cash-registers/active');
    return response.data;
  },

  getCashRegisterById: async (id) => {
    const response = await api.get(`/cash-registers/${id}`);
    return response.data;
  },

  closeCashRegister: async (id, closingAmount, notes) => {
    const response = await api.post(`/cash-registers/${id}/close`, {
      closing_amount: closingAmount,
      notes
    });
    return response.data;
  },

  getAllCashRegisters: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cash-registers?${params}`);
    return response.data;
  }
};

export default cashRegisterService;
