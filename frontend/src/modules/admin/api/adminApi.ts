import axiosInstance from "@/api/axios";
import { PagedResponse, UserResponse } from "@/types";
import { AuditLogResponse, CreateAdminUserRequest, UpdateUserRoleRequest } from "../types/admin";

const API_PREFIX = "/admin";

export const adminApi = {
  getAllUsers: async (page = 0, size = 10): Promise<PagedResponse<UserResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/users`, { params: { page, size } });
    return response.data.data;
  },

  createAdminUser: async (data: CreateAdminUserRequest): Promise<UserResponse> => {
    const response = await axiosInstance.post(`${API_PREFIX}/users`, data);
    return response.data.data;
  },

  updateUserRole: async (userId: number, role: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER'): Promise<UserResponse> => {
    const response = await axiosInstance.patch(`${API_PREFIX}/users/${userId}/role`, { role });
    return response.data.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await axiosInstance.delete(`${API_PREFIX}/users/${userId}`);
  },

  updateUserStatus: async (userId: number, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE', reason?: string): Promise<UserResponse> => {
    const response = await axiosInstance.patch(`${API_PREFIX}/users/${userId}/status`, null, { params: { status, reason } });
    return response.data.data;
  },

  getAuditLogs: async (page = 0, size = 10): Promise<PagedResponse<AuditLogResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/audit-logs`, { params: { page, size } });
    return response.data.data;
  },
};

