import axiosInstance from "./axios";

const AUTH_PREFIX = "/auth";

export const authApi = {
  register: async (data: any) => {
    return await axiosInstance.post(`${AUTH_PREFIX}/register`, data);
  },
  login: async (data: any) => {
    return await axiosInstance.post(`${AUTH_PREFIX}/login`, data);
  },
  logout: async () => {
    return await axiosInstance.post(`${AUTH_PREFIX}/logout`);
  },
  forgotPassword: async (email: string) => {
    return await axiosInstance.post(`${AUTH_PREFIX}/forgot-password`, { email });
  },
  resetPassword: async (token: string, newPassword: string) => {
    return await axiosInstance.post(`${AUTH_PREFIX}/reset-password`, { token, newPassword });
  },
  refreshToken: async () => {
    return await axiosInstance.post(`${AUTH_PREFIX}/refresh`);
  },
  getCurrentUser: async () => {
    return await axiosInstance.get(`/users/me`);
  }
};
