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
 * Get a specific claim with complete status timeline history
 * @param {string} claimId - Claim ObjectId
 * @returns {Promise<Object>} - Claim details with populated timeline
 */
export const getClaimById = async (claimId) => {
  const response = await api.get(`/claims/${claimId}`);
  return response.data;
};

/**
 * Update the status of a claim (UNDER_REVIEW, APPROVED, REJECTED, RETURNED)
 * @param {string} claimId - Claim ObjectId
 * @param {string} status - 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETURNED'
 * @param {string} [note] - Optional transition note or rejection reason
 * @returns {Promise<Object>} - Updated claim response with new timeline event
 */
export const updateClaimStatus = async (claimId, status, note = '') => {
  const response = await api.put(`/claims/${claimId}`, { status, note });
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
  getClaimById,
  getMyClaims,
  updateClaimStatus,
};
