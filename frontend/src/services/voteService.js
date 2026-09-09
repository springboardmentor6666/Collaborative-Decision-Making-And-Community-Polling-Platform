/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: voteService.js
 * Architecture Tier: API Service Wrapper (Data Layer)
 * Path: frontend/src/services/voteService.js
 *
 * Purpose:
 *   Voting API service encapsulating ballot submission, user vote retrieval, and voting analysis metrics.
 */

import api from './api';

export const voteService = {
  castVote: async (voteData) => {
    const response = await api.post('/votes', voteData);
    return response.data;
  },

  getVoteResults: async (decisionId) => {
    const response = await api.get(`/votes/result/${decisionId}`);
    return response.data;
  },
};
