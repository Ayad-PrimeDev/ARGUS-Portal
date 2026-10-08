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
