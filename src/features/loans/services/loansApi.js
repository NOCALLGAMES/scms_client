import api from '../../../lib/api';

// ─── Loan Applications ────────────────────────────────────────────────────────
export const applyForLoan = async (loanData) => {
    const { data } = await api.post('/loans/apply', loanData);
    return data.data;
};

export const getMyLoans = async () => {
    const { data } = await api.get('/loans/my-loans');
    return data.data;
};

export const cancelLoan = async (id) => {
    const { data } = await api.patch(`/loans/${id}/cancel`);
    return data.data;
};

export const getLoanById = async (id) => {
    const { data } = await api.get(`/loans/${id}`);
    return data.data.loan;
};

// ─── Admin: Loan Management ───────────────────────────────────────────────────
export const getAllLoans = async (params) => {
    const { data } = await api.get('/loans', { params });
    return data.data;
};

export const getPortfolioStats = async () => {
    const { data } = await api.get('/loans/stats/portfolio');
    return data.data;
};

export const approveLoan = async (id) => {
    const { data } = await api.patch(`/loans/${id}/approve`);
    return data.data;
};

export const rejectLoan = async (id, body = {}) => {
    const { data } = await api.patch(`/loans/${id}/reject`, body);
    return data.data;
};

export const startReview = async (id) => {
    const { data } = await api.patch(`/loans/${id}/under-review`);
    return data.data;
};

export const disburseLoan = async (id, data = {}) => {
    const response = await api.patch(`/loans/${id}/disburse`, data);
    return response.data.data;
};

// ─── Repayments ───────────────────────────────────────────────────────────────
export const recordRepayment = async ({ loanId, amount, date, method }) => {
    const { data } = await api.post(`/loans/${loanId}/repayments`, {
        amount,
        date,
        method,
    });
    return data.data;
};

export const getLoanRepayments = async (loanId) => {
    const { data } = await api.get(`/loans/${loanId}/repayments`);
    return data.data;
};

// ─── Guarantors ───────────────────────────────────────────────────────────────
export const addGuarantor = async ({ loanId, guarantorData }) => {
    const { data } = await api.post(`/loans/${loanId}/guarantors`, guarantorData);
    return data.data;
};

export const removeGuarantor = async (loanId, guarantorId) => {
    const { data } = await api.delete(`/loans/${loanId}/guarantors/${guarantorId}`);
    return data.data;
};
// ─── Settings ────────────────────────────────────────────────────────────────
export const getLoanSettings = async () => {
    const { data } = await api.get('/admin/settings/public');
    return data.data.settings;
};
