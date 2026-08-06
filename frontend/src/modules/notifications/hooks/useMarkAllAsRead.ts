import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      // Optimistically update the unread count to 0
      queryClient.setQueryData(['unreadNotificationsCount'], 0);
      
      // Refetch the full list to update the read status of individual items
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
