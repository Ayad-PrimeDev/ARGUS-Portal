import api from './api';

/**
 * Item Service
 * Handles communication with the backend /api/items endpoints.
 */

/**
 * Get all active items with optional query filters (type, category)
 * @param {Object} params - Query parameters, e.g. { type: 'LOST', category: 'Electronics' }
 * @returns {Promise<Array>} - List of items returned by the server
 */
export const getItems = async (params = {}) => {
  const response = await api.get('/items', { params });
  return response.data;
};

/**
 * Fetch a specific item by its database ID
 * @param {string} id - Item ObjectId
 * @returns {Promise<Object>} - Item details
 */
export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export default {
  getItems,
  getItemById,
};
