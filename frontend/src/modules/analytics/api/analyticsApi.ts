import api from "../../../api/axios";
import { DashboardStats, CommunityAnalytics, DecisionAnalytics, UserAnalytics } from "../types/analytics";

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },
  getCommunityAnalytics: async (communityId: number): Promise<CommunityAnalytics> => {
    const response = await api.get(`/analytics/community/${communityId}`);
    return response.data.data;
  },
  getDecisionAnalytics: async (decisionId: number): Promise<DecisionAnalytics> => {
    const response = await api.get(`/analytics/decision/${decisionId}`);
    return response.data.data;
  },
  getUserAnalytics: async (userId: number): Promise<UserAnalytics> => {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data.data;
  },
};
