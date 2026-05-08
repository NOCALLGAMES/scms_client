import api from '../../../lib/api';

/**
 * Super Admin API Service
 * Handles system-wide API calls for super admin dashboard
 */

// ─── Get System-Wide Statistics ─────────────────────────────────────────────
export const getSystemStats = async () => {
    const { data } = await api.get('/super-admin/stats');
    return data.data;
};

// ─── Get Recent Activity Across All Institutions ─────────────────────────────
export const getRecentActivity = async (limit = 10) => {
    const { data } = await api.get('/super-admin/recent-activity', {
        params: { limit }
    });
    return data.data;
};

// ─── Get Institutions with Summary Stats ────────────────────────────────────
export const getInstitutionsSummary = async () => {
    const { data } = await api.get('/super-admin/institutions-summary');
    return data.data.institutions;
};

// ─── Get Specific Institution Detail ────────────────────────────────────────
export const getInstitutionDetail = async (id) => {
    const { data } = await api.get(`/super-admin/institutions/${id}`);
    return data.data;
};

// ─── Search Any User Across All Institutions ────────────────────────────────
export const searchAllUsers = async (query) => {
    const { data } = await api.get('/super-admin/users/search', {
        params: { query }
    });
    return data.data.users;
};

// ─── Get Platform Administrators ─────────────────────────────────────────────
export const getPlatformAdmins = async () => {
    const { data } = await api.get('/super-admin/users');
    return data.data.admins;
};

// ─── Create Platform Administrator ──────────────────────────────────────────
export const createPlatformAdmin = async (adminData) => {
    const { data } = await api.post('/super-admin/users', adminData);
    return data.data.user;
};

// ─── Get Platform Audit Logs ────────────────────────────────────────────────
export const getAuditLogs = async (params = {}) => {
    const { data } = await api.get('/super-admin/audit-logs', { params });
    return data.data;
};
