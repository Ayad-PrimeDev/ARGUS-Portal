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

/**
 * Create a new lost or found item in the registry
 * @param {Object} itemData - Item details matching backend Item model
 * @returns {Promise<Object>} - Created item record
 */
export const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data;
};

/**
 * Get all items submitted by the currently logged-in user
 * @returns {Promise<Array>} - List of user's items
 */
export const getMyItems = async () => {
  const response = await api.get('/items/my');
  return response.data;
};

export default {
  getItems,
  getItemById,
  createItem,
  getMyItems,
};
