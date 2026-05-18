import api from '../../../lib/api';

export const getPostingStats = async (params) => {
    const response = await api.get('/interest/stats', { params });
    return response.data.data;
};

export const processPosting = async (data) => {
    const response = await api.post('/interest/process', data);
    return response.data;
};

export const approvePosting = async (id) => {
    const response = await api.post(`/interest/approve/${id}`);
    return response.data;
};

export const rejectPosting = async (id, data) => {
    const response = await api.post(`/interest/reject/${id}`, data);
    return response.data;
};

export const getPostingHistory = async () => {
    const response = await api.get('/interest/history');
    return response.data.data;
};
