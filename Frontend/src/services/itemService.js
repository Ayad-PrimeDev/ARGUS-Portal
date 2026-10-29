import api from './api';

export const getItems = async (params = {}) => {
  const response = await api.get('/items', { params });
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data;
};

export const getMyItems = async () => {
  const response = await api.get('/items/my');
  return response.data;
};

export const updateItem = async (id, updateData) => {
  const response = await api.put(`/items/${id}`, updateData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

export const flagItem = async (id, flagData) => {
  const response = await api.post(`/items/${id}/flag`, flagData);
  return response.data;
};

export default {
  getItems,
  getItemById,
  createItem,
  getMyItems,
  updateItem,
  deleteItem,
  flagItem,
};
