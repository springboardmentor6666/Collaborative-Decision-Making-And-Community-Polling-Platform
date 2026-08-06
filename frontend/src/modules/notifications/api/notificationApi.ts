import api from '../../../api/axios';
import { ApiResponse, PagedResponse } from '../../../types';
import { NotificationResponse } from '../types/notification';

export const notificationApi = {
  getNotifications: async (page: number = 0, size: number = 20): Promise<PagedResponse<NotificationResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<NotificationResponse>>>('/notifications', {
      params: { page, size },
    });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
