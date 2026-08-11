import axiosInstance from "./axios";
import { ApiResponse, DashboardStats } from "../types";

export const analyticsApi = {
  getDashboardStats: async () => {
    return await axiosInstance.get<ApiResponse<DashboardStats>>(`/analytics/dashboard`);
  },
  getUserAnalytics: async (userId: number) => {
    return await axiosInstance.get<ApiResponse<any>>(`/analytics/user/${userId}`);
  },
};
