import api from '../../../lib/api';

export const getFinancialReports = async (params) => {
    const { data } = await api.get('/reports', { params });
    return data.data;
};

export const getTrialBalance = async (period) => {
    const { data } = await api.get('/reports/trial-balance', { params: { period } });
    return data.data;
};

export const getBalanceSheet = async (period) => {
    const { data } = await api.get('/reports/balance-sheet', { params: { period } });
    return data.data;
};

export const getProfitAndLoss = async (period) => {
    const { data } = await api.get('/reports/profit-loss', { params: { period } });
    return data.data;
};
