import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useDecisionAnalytics = (decisionId: number) => {
  return useQuery({
    queryKey: ['analytics', 'decision', decisionId],
    queryFn: () => analyticsApi.getDecisionAnalytics(decisionId),
    enabled: !!decisionId,
    staleTime: 60 * 1000,
  });
};
