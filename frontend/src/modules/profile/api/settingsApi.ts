import axiosInstance from '@/api/axios';
import {
  ApiResponse,
  ChangePasswordRequest,
  UserPreferences,
  UserPreferencesRequest,
  UserDataExportResponse
} from '../../../types';

export const settingsApi = {
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.put<ApiResponse<void>>('/users/me/password', data);
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await axiosInstance.get<ApiResponse<UserPreferences>>('/users/me/preferences');
    return response.data.data;
  },

  updatePreferences: async (data: UserPreferencesRequest): Promise<UserPreferences> => {
    const response = await axiosInstance.put<ApiResponse<UserPreferences>>('/users/me/preferences', data);
    return response.data.data;
  },

  exportUserData: async (): Promise<UserDataExportResponse> => {
    const response = await axiosInstance.get<ApiResponse<UserDataExportResponse>>('/users/me/export');
    return response.data.data;
  }
};
