import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '@/context/AuthContext';

export const useNotifications = (pageSize = 20) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 0 }) => notificationApi.getNotifications(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!user,
    // Poll every 30 seconds to simulate real-time updates
    refetchInterval: 30000,
  });
};
