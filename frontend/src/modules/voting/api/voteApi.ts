import api from "@/api/axios";
import { VoteRequest, VoteResponse, VoteResultResponse } from "../types/vote";
import { ApiResponse } from "@/types";

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

  getVoteResults: async (decisionId: number): Promise<VoteResultResponse> => {
    const response = await api.get<ApiResponse<VoteResultResponse>>(`/votes/decision/${decisionId}/results`);
    return response.data.data;
  }
};
