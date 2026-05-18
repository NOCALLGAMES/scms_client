import api from '../../../lib/api';

export const getBalanceSheet = async () => {
    const response = await api.get('/reports/balance-sheet');
    return response.data;
};

export const getIncomeStatement = async (params = {}) => {
    const response = await api.get('/reports/income-statement', { params });
    return response.data;
};
