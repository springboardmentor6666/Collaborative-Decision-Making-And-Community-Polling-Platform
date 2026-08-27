import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (id, profileData) => {
    const response = await api.put(`/users/${id}`, profileData);
    return response.data;
  },

  getUserInterests: async () => {
    const response = await api.get('/users/me/interests');
    return response.data;
  },

  updateUserInterests: async (categoryIds) => {
    const response = await api.post('/users/me/interests', { categoryIds });
    return response.data;
  },

  getSavedDecisions: async () => {
    const response = await api.get('/users/me/saved-decisions');
    return response.data;
  },

  saveDecision: async (decisionId) => {
    const response = await api.post('/users/me/saved-decisions', { decisionId: Number(decisionId) });
    return response.data;
  },

  unsaveDecision: async (decisionId) => {
    const response = await api.delete(`/users/me/saved-decisions/${decisionId}`);
    return response.data;
  },
};
