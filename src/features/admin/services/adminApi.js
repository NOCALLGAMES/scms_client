import api from '../../../lib/api';

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export const getFinancialSummary = async () => {
    const { data } = await api.get('/admin/financial-summary');
    return data.data.summary;
};

export const getLoanMetrics = async () => {
    const { data } = await api.get('/admin/loan-metrics');
    return data.data;
};

export const getSavingsMetrics = async () => {
    const { data } = await api.get('/admin/savings-metrics');
    return data.data;
};

// ─── System Settings ──────────────────────────────────────────────────────────
export const getSettings = async () => {
    const { data } = await api.get('/admin/settings');
    return data.data;
};

export const updateSettings = async (settings) => {
    const { data } = await api.patch('/admin/settings', settings);
    return data.data;
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (params) => {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data.data;
};


module.exports = {
    getFinancialSummary,
    getLoanMetrics,
    getSavingsMetrics,
    getSettings,
    updateSettings,
    getAuditLogs
};
