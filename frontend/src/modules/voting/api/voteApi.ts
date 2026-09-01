import api from "@/api/axios";
import { VoteRequest, VoteResponse, VoteResultResponse } from "../types/vote";
import { ApiResponse, PagedResponse } from "@/types";

export const voteApi = {
  castVote: async (request: VoteRequest): Promise<VoteResponse> => {
    const response = await api.post<ApiResponse<VoteResponse>>("/votes", request);
    return response.data.data;
  },

  castAnonymousVote: async (request: VoteRequest): Promise<VoteResponse> => {
    const response = await api.post<ApiResponse<VoteResponse>>("/votes/anonymous", request);
    return response.data.data;
  },

  changeVote: async (voteId: number, request: VoteRequest): Promise<VoteResponse> => {
    const response = await api.put<ApiResponse<VoteResponse>>(`/votes/${voteId}`, request);
    return response.data.data;
  },

  getUserVote: async (decisionId: number): Promise<VoteResponse | null> => {
    const response = await api.get<ApiResponse<VoteResponse | null>>(`/votes/decision/${decisionId}/me`);
    return response.data.data;
  },

  getVoteResults: async (decisionId: number): Promise<VoteResultResponse> => {
    const response = await api.get<ApiResponse<VoteResultResponse>>(`/votes/decision/${decisionId}/results`);
    return response.data.data;
  },

  getMyVotes: async (page = 0, size = 20): Promise<PagedResponse<VoteResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<VoteResponse>>>("/votes/my", {
      params: { page, size }
    });
    return response.data.data;
  }
};

