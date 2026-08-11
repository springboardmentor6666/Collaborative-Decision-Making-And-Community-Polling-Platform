import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '@/context/AuthContext';

export const useUnreadCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: notificationApi.getUnreadCount,
    enabled: !!user,
    // Poll more frequently for the unread badge
    refetchInterval: 15000,
  });
};
