import { useInfiniteQuery } from "@tanstack/react-query";
import { voteApi } from "../api/voteApi";
import { useAuth } from "@/context/AuthContext";

export function useMyVotes(pageSize = 20) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ["myVotes", user?.userId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const res = await voteApi.getMyVotes(pageParam, pageSize);
        return res || { content: [], page: 0, size: pageSize, totalElements: 0, totalPages: 0, last: true };
      } catch (err) {
        console.warn("Failed to fetch user votes history:", err);
        return { content: [], page: 0, size: pageSize, totalElements: 0, totalPages: 0, last: true };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!user,
  });
}
