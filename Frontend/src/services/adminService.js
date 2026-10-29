import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getAdminUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, { isSuspended, reason }) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { isSuspended, reason });
  return response.data;
};

export const updateUserRole = async (userId, { role, reason }) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role, reason });
  return response.data;
};

export const getAdminItems = async (params = {}) => {
  const response = await api.get('/admin/items', { params });
  return response.data;
};

export const updateItemStatus = async (itemId, { status, reason }) => {
  const response = await api.patch(`/admin/items/${itemId}/status`, { status, reason });
  return response.data;
};

export const moderateItem = async (itemId, { action, reason }) => {
  const response = await api.patch(`/admin/items/${itemId}/moderate`, { action, reason });
  return response.data;
};

export const getAdminClaims = async (params = {}) => {
  const response = await api.get('/admin/claims', { params });
  return response.data;
};

export const resolveClaimByAdmin = async (claimId, { status, decisionReason }) => {
  const response = await api.patch(`/admin/claims/${claimId}/resolve`, { status, decisionReason });
  return response.data;
};

export const getModerationQueue = async () => {
  const response = await api.get('/admin/moderation');
  return response.data;
};

export const dismissFlags = async (itemId, { reason }) => {
  const response = await api.post(`/admin/moderation/${itemId}/dismiss`, { reason });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/admin/logs', { params });
  return response.data;
};

export default {
  getAdminStats,
  getAdminUsers,
  getAdminUserDetails,
  updateUserStatus,
  updateUserRole,
  getAdminItems,
  updateItemStatus,
  moderateItem,
  getAdminClaims,
  resolveClaimByAdmin,
  getModerationQueue,
  dismissFlags,
  getAuditLogs,
};
