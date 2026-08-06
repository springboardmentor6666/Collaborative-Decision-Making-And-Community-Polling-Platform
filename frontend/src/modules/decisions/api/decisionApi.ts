import axiosInstance from "@/api/axios";
import { PagedResponse } from "@/types";
import { 
  DecisionRequest, 
  DecisionResponse, 
  DecisionStatus, 
  DecisionVisibility, 
  VoteType 
} from "../types/decision";

const API_PREFIX = "/decisions";
const USER_API_PREFIX = "/users/me/saved";

export interface SearchDecisionsParams {
  query?: string;
  communityId?: number;
  visibility?: DecisionVisibility;
  status?: DecisionStatus;
  voteType?: VoteType;
  createdById?: number;
  page?: number;
  size?: number;
}

export const decisionApi = {
  createDecision: async (data: DecisionRequest): Promise<DecisionResponse> => {
    const response = await axiosInstance.post(API_PREFIX, data);
    return response.data.data;
  },

  updateDecision: async (id: number, data: DecisionRequest): Promise<DecisionResponse> => {
    const response = await axiosInstance.put(`${API_PREFIX}/${id}`, data);
    return response.data.data;
  },

  getDecisionById: async (id: number): Promise<DecisionResponse> => {
    const response = await axiosInstance.get(`${API_PREFIX}/${id}`);
    return response.data.data;
  },

  deleteDecision: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_PREFIX}/${id}`);
  },

  searchDecisions: async (params: SearchDecisionsParams): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get(API_PREFIX, { params });
    return response.data.data;
  },

  getTrending: async (params: { page?: number; size?: number }): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/trending`, { params });
    return response.data.data;
  },

  getPopular: async (params: { page?: number; size?: number }): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/popular`, { params });
    return response.data.data;
  },

  getLatest: async (params: { page?: number; size?: number }): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/latest`, { params });
    return response.data.data;
  },

  // Saved Decisions (Bookmarks)
  getSavedDecisions: async (params: { page?: number; size?: number }): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get(USER_API_PREFIX, { params });
    return response.data.data;
  },

  saveDecision: async (decisionId: number): Promise<void> => {
    await axiosInstance.post(`${USER_API_PREFIX}/${decisionId}`);
  },

  unsaveDecision: async (decisionId: number): Promise<void> => {
    await axiosInstance.delete(`${USER_API_PREFIX}/${decisionId}`);
  },
};
