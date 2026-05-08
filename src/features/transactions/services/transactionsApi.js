import api from '../../../lib/api';

export const getTransactionHistory = async (params) => {
    const { data } = await api.get('/transactions', { params });
    return data.data;
};

export const deposit = async ({ accountId, amount, description, idempotencyKey }) => {
    const { data } = await api.post('/transactions/deposit', {
        accountId,
        amount,
        description,
    }, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    });
    return data.data;
};

export const withdraw = async ({ accountId, amount, description, idempotencyKey }) => {
    const { data } = await api.post('/transactions/withdraw', {
        accountId,
        amount,
        description,
    }, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    });
    return data.data;
};

export const getAccountStatement = async ({ accountId, startDate, endDate, page, limit }) => {
    const { data } = await api.get(`/accounts/${accountId}/statement`, {
        params: { startDate, endDate, page, limit },
    });
    return data.data;
};

