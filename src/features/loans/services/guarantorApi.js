import API from "../../../lib/api";

/**
 * Get all guarantor requests for the logged-in user
 */
export const getGuarantorRequests = async () => {
  const response = await API.get("/loans/guarantor-requests");
  return response.data;
};

/**
 * Accept or decline a guarantor request
 * @param {number} guarantorId - LoanGuarantor record ID
 * @param {string} status - 'accepted' | 'rejected'
 */
export const respondToGuarantorRequest = async (guarantorId, status) => {
  const response = await API.patch(`/loans/guarantor-requests/${guarantorId}`, { status });
  return response.data;
};

/**
 * Dismiss a guarantor request from view
 * @param {number} guarantorId 
 */
export const dismissGuarantorRequest = async (guarantorId) => {
  const response = await API.patch(`/loans/guarantor-requests/${guarantorId}/dismiss`);
  return response.data;
};

/**
 * Add guarantors to a pending loan
 * @param {number} loanId
 * @param {number[]} guarantorUserIds - Array of user IDs
 */
export const addGuarantors = async (loanId, guarantorUserIds) => {
  const response = await API.post(`/loans/${loanId}/guarantors`, { guarantorUserIds });
  return response.data;
};
