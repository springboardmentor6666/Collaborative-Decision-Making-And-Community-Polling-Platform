import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useCommunityAnalytics = (communityId: number) => {
  return useQuery({
    queryKey: ['analytics', 'community', communityId],
    queryFn: () => analyticsApi.getCommunityAnalytics(communityId),
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });
};
