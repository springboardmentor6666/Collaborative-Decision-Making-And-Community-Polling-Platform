import axiosInstance from "./axios";
import { ApiResponse, UserResponse } from "../types";

export const userApi = {
  getCurrentUser: async () => {
    return await axiosInstance.get<ApiResponse<UserResponse>>(`/users/me`);
  }
};
