import api from '../../../lib/api';

/**
 * Institution API Service
 * Handles all API calls for institution management (super admin only)
 */

// ─── Get All Institutions ───────────────────────────────────────────────────
export const getAllInstitutions = async () => {
    const { data } = await api.get('/institutions');
    return data.data.institutions;
};

// ─── Get My Institution ─────────────────────────────────────────────────────
export const getMyInstitution = async () => {
    const { data } = await api.get('/institutions/my-institution');
    return data.data.institution;
};

// ─── Create Institution ───────────────────────────────────────────────────────
export const createInstitution = async (institutionData) => {
    const { data } = await api.post('/institutions', institutionData);
    return data.data;
};

// ─── Update Institution ─────────────────────────────────────────────────────
export const updateInstitution = async (id, institutionData) => {
    const { data } = await api.patch(`/institutions/${id}`, institutionData);
    return data.data.institution;
};

// ─── Update My Institution ──────────────────────────────────────────────────
export const updateMyInstitution = async (institutionData) => {
    const { data } = await api.patch('/institutions/my-institution', institutionData);
    return data.data.institution;
};
