import { useInfiniteQuery } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';

export const useComments = (decisionId: number) => {
  return useInfiniteQuery({
    queryKey: ['comments', decisionId],
    queryFn: ({ pageParam = 0 }) => commentApi.fetchComments(decisionId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (!lastPage.last) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!decisionId,
  });
};
