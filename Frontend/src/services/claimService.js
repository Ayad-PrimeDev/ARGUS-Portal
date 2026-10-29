import api from './api';

export const createClaim = async (claimData) => {
  const response = await api.post('/claims', claimData);
  return response.data;
};

export const getClaims = async () => {
  const response = await api.get('/claims');
  return response.data;
};

export const getClaimById = async (claimId) => {
  const response = await api.get(`/claims/${claimId}`);
  return response.data;
};

export const updateClaimStatus = async (claimId, status, note = '') => {
  const response = await api.put(`/claims/${claimId}`, { status, note });
  return response.data;
};

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
