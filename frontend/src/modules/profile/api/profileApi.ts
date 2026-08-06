import axiosInstance from '@/api/axios';
import { ApiResponse, UserResponse, DecisionResponse, PagedResponse } from '../../../types';

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
}

export const profileApi = {
  getProfile: async (): Promise<UserResponse> => {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await axiosInstance.put<ApiResponse<UserResponse>>('/users/me', data);
    return response.data.data;
  },

  deleteAccount: async (): Promise<void> => {
    await axiosInstance.delete('/users/me');
  },

  getSavedDecisions: async (page = 0, size = 10): Promise<PagedResponse<DecisionResponse>> => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<DecisionResponse>>>(`/users/me/saved?page=${page}&size=${size}`);
    return response.data.data;
  },

  saveDecision: async (decisionId: number): Promise<void> => {
    await axiosInstance.post(`/users/me/saved/${decisionId}`);
  },

  unsaveDecision: async (decisionId: number): Promise<void> => {
    await axiosInstance.delete(`/users/me/saved/${decisionId}`);
  }
};
