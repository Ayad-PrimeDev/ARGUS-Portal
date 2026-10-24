import api from './api';

/**
 * User Service
 * Handles user profile, verified reputation stats, and rating requests.
 */

/**
 * Get current logged-in user profile, verified contribution points, tier, and reports
 * @returns {Promise<Object>} Profile and reputation data
 */
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update editable fields of the user profile (name, bio, profileImage, phoneNumber)
 * @param {Object} profileData - { name, bio, profileImage, phoneNumber }
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

/**
 * Get public profile and verified reputation for any user
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Public profile and reputation data
 */
export const getPublicProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Submit a 1-5 star trust rating for a verified completed return
 * @param {Object} ratingData - { itemId, rating, review }
 * @returns {Promise<Object>} Created rating record
 */
export const submitRating = async (ratingData) => {
  const response = await api.post('/users/rate', ratingData);
  return response.data;
};

export default {
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  submitRating,
};
