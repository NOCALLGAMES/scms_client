import api from '../../../lib/api';

export const computeDividends = async (dividendData) => {
    const { data } = await api.post('/dividends/compute', dividendData);
    return data;
};

export const getDividendHistory = async () => {
    const { data } = await api.get('/dividends');
    return data.data.runs;
};
