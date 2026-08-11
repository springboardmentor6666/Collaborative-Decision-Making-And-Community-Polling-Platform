import axiosInstance from "./axios";
import { ApiResponse, PagedResponse, NotificationResponse } from "../types";

export const notificationApi = {
  getUnreadCount: async () => {
    return await axiosInstance.get<ApiResponse<number>>(`/notifications/unread-count`);
  },
  getUserNotifications: async (page = 0, size = 10) => {
    return await axiosInstance.get<ApiResponse<PagedResponse<NotificationResponse>>>(`/notifications`, {
      params: { page, size }
    });
  }
};
