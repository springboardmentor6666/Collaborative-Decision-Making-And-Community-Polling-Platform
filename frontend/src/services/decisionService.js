/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: decisionService.js
 * Architecture Tier: API Service Wrapper (Data Layer)
 * Path: frontend/src/services/decisionService.js
 *
 * Purpose:
 *   Decision API service handling CRUD operations, factor scores, option creation, bookmarks, and status transitions.
 */

import api from './api';

export const decisionService = {
  getAllDecisions: async () => {
    const response = await api.get('/decisions');
    return response.data;
  },

  getDecisionById: async (id) => {
    const response = await api.get(`/decisions/${id}`);
    return response.data;
  },

  createDecision: async (decisionData) => {
    const response = await api.post('/decisions', decisionData);
    return response.data;
  },

  updateDecision: async (id, decisionData) => {
    const response = await api.put(`/decisions/${id}`, decisionData);
    return response.data;
  },

  deleteDecision: async (id) => {
    const response = await api.delete(`/decisions/${id}`);
    return response.data;
  },
};
