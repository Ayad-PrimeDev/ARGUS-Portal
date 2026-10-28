import api from './api';

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - Response data
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in an existing user
 * @param {Object} userData - { email, password }
 * @returns {Promise<Object>} - Response data
 */
export const loginUser = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

/**
 * Log out the current user
 * @returns {Promise<Object>} - Response data
 */
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Change current logged-in user's password
 * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<Object>} - Response data
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Request a password reset link for the given email
 * @param {string} email
 * @returns {Promise<Object>} - Response data
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password using a valid reset token
 * @param {string} token
 * @param {Object} resetData - { password, confirmPassword }
 * @returns {Promise<Object>} - Response data
 */
export const resetPassword = async (token, resetData) => {
  const response = await api.post(`/auth/reset-password/${token}`, resetData);
  return response.data;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
