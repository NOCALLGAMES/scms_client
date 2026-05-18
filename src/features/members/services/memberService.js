import api from '../../../lib/api';

/**
 * Fetch all members (users with role 'member')
 * @param {Object} params - Query parameters (status, etc.)
 */
export const getMembers = async (params = {}) => {
    const { data } = await api.get('/users', {
        params: { ...params, role: 'member', status: 'active' }
    });
    return data.data.users;
};

/**
 * Fetch all users (admin only)
 * @param {Object} params 
 */
export const getAllUsers = async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data.data.users;
};

/**
 * Get detailed profile for a specific user/member
 * @param {string} id 
 */
export const getMemberProfile = async (id) => {
    const { data } = await api.get(`/users/${id}`); // We might need to add this endpoint to userRoutes
    return data.data.user;
};

/**
 * Update member status or role
 * @param {string} id 
 * @param {Object} updateData 
 */
export const updateMember = async (id, updateData) => {
    const { data } = await api.patch(`/users/${id}/admin-update`, updateData);
    return data.data.user;
};

/**
 * Approve a pending registration
 * @param {string} id 
 */
export const approveMember = async (id) => {
    const { data } = await api.patch(`/users/${id}/approve`);
    return data.data;
};

/**
 * Reject a pending registration
 * @param {string} id 
 * @param {string} reason 
 */
export const rejectMember = async (id, reason) => {
    const { data } = await api.patch(`/users/${id}/reject`, { reason });
    return data.data;
};

/**
 * Fetch users with pending approval status
 */
export const getPendingUsers = async () => {
    // Using the new array support in the backend
    const { data } = await api.get('/users', {
        params: {
            status: ['pending_approval', 'rejected']
        }
    });
    return data.data.users;
};

/**
 * Fetch all admins and staff
 */
export const getAdmins = async () => {
    const { data } = await api.get('/users', {
        params: {
            role: ['super_admin', 'staff']
        }
    });
    return data.data.users;
};

/**
 * Admin creates a user directly
 * @param {Object} userData 
 */
export const adminCreateUser = async (userData) => {
    const { data } = await api.post('/users/admin-create', userData);
    return data.data.user;
};

/**
 * Get financial summary for a user
 * @param {string} userId 
 */
export const getUserFinancials = async (userId) => {
    const { data } = await api.get(`/accounts/user/${userId}`);
    return data.data;
};
