import api from '../../../lib/api';

export const purchaseShares = async (purchaseData) => {
    const { data } = await api.post('/accounts/shares/purchase', purchaseData);
    return data;
};

export const getMemberShares = async (userId) => {
    const { data } = await api.get(`/accounts/user/${userId}`);
    return data.data.accounts.find(a => a.accountType === 'share_capital');
};

export const buyFromSavings = async (amount) => {
    const { data } = await api.post('/accounts/shares/buy-from-savings', { amount });
    return data;
};
