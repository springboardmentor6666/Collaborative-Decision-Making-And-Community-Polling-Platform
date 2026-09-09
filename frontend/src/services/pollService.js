/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: pollService.js
 * Architecture Tier: API Service Wrapper (Data Layer)
 * Path: frontend/src/services/pollService.js
 *
 * Purpose:
 *   Poll API service managing poll retrieval, ballot submission, vote calculations, and ranked-choice results.
 */

import api from './api';

export const pollService = {
  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  getAllPolls: async () => {
    const response = await api.get('/polls');
    return response.data;
  },

  getPollByDecisionId: async (decisionId) => {
    const response = await api.get(`/polls/decision/${decisionId}`);
    return response.data;
  },
};
