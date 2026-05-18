import API from "../../../lib/api";

/**
 * Get repayment history and schedule for a specific loan
 */
export const getLoanRepayments = async (loanId) => {
  const response = await API.get(`/loans/${loanId}/repayments`);
  return response.data;
};

/**
 * Make a manual loan repayment
 * @param {number} loanId 
 * @param {Object} data - { amount, paymentMethod }
 */
export const makeRepayment = async (loanId, data) => {
  const response = await API.post(`/loans/${loanId}/repay`, data);
  return response.data;
};

/**
 * Get consolidated repayment history for all loans of the current user
 */
export const getMyTotalRepaymentHistory = async () => {
  const response = await API.get('/loans/repayments/my-history');
  return response.data;
};
