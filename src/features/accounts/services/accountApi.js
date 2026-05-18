import api from '../../../lib/api';

export const getMyAccounts = async () => {
    const { data } = await api.get('/accounts/my-accounts');
    return data.data.accounts || [];
};

export const getAccountById = async (id) => {
    const { data } = await api.get(`/accounts/${id}`);
    return data.data.account;
};
