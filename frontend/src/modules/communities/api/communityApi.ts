import axiosInstance from "@/api/axios";
import { PagedResponse } from "@/types";
import { CommunityRequest, CommunityResponse, CommunityMemberResponse, CommunityVisibility, MemberRole } from "../types/community";

const API_PREFIX = "/communities";

export const communityApi = {
  createCommunity: async (data: CommunityRequest): Promise<CommunityResponse> => {
    const response = await axiosInstance.post(API_PREFIX, data);
    return response.data.data;
  },

  updateCommunity: async (id: number, data: CommunityRequest): Promise<CommunityResponse> => {
    const response = await axiosInstance.put(`${API_PREFIX}/${id}`, data);
    return response.data.data;
  },

  getCommunityById: async (id: number): Promise<CommunityResponse> => {
    const response = await axiosInstance.get(`${API_PREFIX}/${id}`);
    return response.data.data;
  },

  searchCommunities: async (params: { query?: string, visibility?: CommunityVisibility, ownerId?: number, page?: number, size?: number }): Promise<PagedResponse<CommunityResponse>> => {
    const response = await axiosInstance.get(API_PREFIX, { params });
    return response.data.data;
  },

  getMyCommunities: async (params: { page?: number, size?: number }): Promise<PagedResponse<CommunityResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/my`, { params });
    return response.data.data;
  },

  deleteCommunity: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_PREFIX}/${id}`);
  },

  joinCommunity: async (id: number): Promise<CommunityMemberResponse> => {
    const response = await axiosInstance.post(`${API_PREFIX}/${id}/join`);
    return response.data.data;
  },

  leaveCommunity: async (id: number): Promise<void> => {
    await axiosInstance.post(`${API_PREFIX}/${id}/leave`);
  },

  getMembers: async (id: number, params: { page?: number, size?: number }): Promise<PagedResponse<CommunityMemberResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/${id}/members`, { params });
    return response.data.data;
  },

  updateMemberRole: async (communityId: number, userId: number, role: MemberRole): Promise<void> => {
    await axiosInstance.put(`${API_PREFIX}/${communityId}/members/${userId}/role`, null, { params: { role } });
  },

  removeMember: async (communityId: number, userId: number): Promise<void> => {
    await axiosInstance.delete(`${API_PREFIX}/${communityId}/members/${userId}`);
  },

  getPendingRequests: async (id: number, params: { page?: number, size?: number }): Promise<PagedResponse<CommunityMemberResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/${id}/requests`, { params });
    return response.data.data;
  },

  approveRequest: async (communityId: number, userId: number): Promise<void> => {
    await axiosInstance.patch(`${API_PREFIX}/${communityId}/members/${userId}/approve`);
  },

  rejectRequest: async (communityId: number, userId: number): Promise<void> => {
    await axiosInstance.patch(`${API_PREFIX}/${communityId}/members/${userId}/reject`);
  },

  inviteUser: async (communityId: number, userId: number): Promise<CommunityMemberResponse> => {
    const response = await axiosInstance.post(`${API_PREFIX}/${communityId}/invite`, null, { params: { userId } });
    return response.data.data;
  },

  getMembership: async (communityId: number): Promise<CommunityMemberResponse | null> => {
    const response = await axiosInstance.get(`${API_PREFIX}/${communityId}/membership`);
    return response.data.data;
  },
};
