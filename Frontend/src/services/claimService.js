import api from './api';

/**
 * Claim Service
 * Handles communication with the backend /api/claims endpoints.
 */

/**
 * Submit an ownership claim for a found item
 * @param {Object} claimData - { itemId, message, providedAnswer }
 * @returns {Promise<Object>} - Created claim response from server
 */
export const createClaim = async (claimData) => {
  const response = await api.post('/claims', claimData);
  return response.data;
};

/**
 * Get all claims received on items created by the logged-in user
 * @returns {Promise<Array>} - List of received claims
 */
export const getClaims = async () => {
  const response = await api.get('/claims');
  return response.data;
};

/**
 * Update the status of a claim (Approve or Reject)
 * @param {string} claimId - Claim ObjectId
 * @param {string} status - 'APPROVED' | 'REJECTED'
 * @returns {Promise<Object>} - Updated claim response
 */
export const updateClaimStatus = async (claimId, status) => {
  const response = await api.put(`/claims/${claimId}`, { status });
  return response.data;
};

/**
 * Get all claims submitted by the logged-in user
 * @returns {Promise<Array>} - List of user's submitted claims
 */
export const getMyClaims = async () => {
  const response = await api.get('/claims/my');
  return response.data;
};

export default {
  createClaim,
  getClaims,
  getMyClaims,
  updateClaimStatus,
};
