import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useDashboardAnalytics = (timeRange: string = 'all') => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: () => analyticsApi.getDashboardStats(timeRange),
    staleTime: 60 * 1000, // 1 minute
  });
};
