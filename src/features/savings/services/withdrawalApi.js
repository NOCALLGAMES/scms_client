import api from '../../../lib/api';

export const requestWithdrawal = async (withdrawalData) => {
    const { data } = await api.post('/withdrawals/request', withdrawalData);
    return data.data;
};

export const getMyWithdrawals = async () => {
    const { data } = await api.get('/withdrawals/my-requests');
    return data.data;
};

export const cancelWithdrawal = async (id) => {
    const { data } = await api.post(`/withdrawals/${id}/cancel`);
    return data.data;
};

// Admin/Staff methods
export const getWithdrawalQueue = async () => {
    const { data } = await api.get('/withdrawals/queue');
    return data.data;
};

export const processWithdrawal = async (id, status, rejectionReason) => {
    const { data } = await api.patch(`/withdrawals/${id}/process`, {
        status,
        rejectionReason
    });
    return data.data;
};
