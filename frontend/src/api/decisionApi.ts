import axiosInstance from "./axios";
import { ApiResponse, PagedResponse, DecisionResponse } from "../types";

export const decisionApi = {
  getLatestDecisions: async (page = 0, size = 10) => {
    return await axiosInstance.get<ApiResponse<PagedResponse<DecisionResponse>>>(`/decisions/latest`, {
      params: { page, size }
    });
  },
  getTrendingDecisions: async (page = 0, size = 10) => {
    return await axiosInstance.get<ApiResponse<PagedResponse<DecisionResponse>>>(`/decisions/trending`, {
      params: { page, size }
    });
  },
  getDecisionById: async (id: number) => {
    return await axiosInstance.get<ApiResponse<DecisionResponse>>(`/decisions/${id}`);
  }
};
