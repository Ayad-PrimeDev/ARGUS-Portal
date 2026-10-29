import api from './api';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const getPublicProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

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
