import api from '../../../lib/api';

/**
 * Initialize a Paystack payment and get a checkout URL
 * @param {number} accountId - The account to fund
 * @param {number} amount - Amount in naira
 */
export const initializePayment = async (accountId, amount) => {
    const { data } = await api.post('/payments/initialize', { accountId, amount });
    return data.data;
};

/**
 * Verify a completed Paystack payment and credit the account
 * @param {string} reference - Paystack payment reference
 * @param {Object} params - Additional query params (for mock mode)
 */
export const verifyPayment = async (reference, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/payments/verify/${reference}${queryString ? `?${queryString}` : ''}`;
    const { data } = await api.get(url);
    return data;
};
