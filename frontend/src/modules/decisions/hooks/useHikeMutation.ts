import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decisionApi } from "../api/decisionApi";
import { DecisionResponse, HikeResponse } from "../types/decision";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const useHikeMutation = (decisionId: number) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Please log in to hike this decision");
      }
      return decisionApi.toggleHike(decisionId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["decisions", "detail", decisionId] });

      const previousDecision = queryClient.getQueryData<DecisionResponse>(["decisions", "detail", decisionId]);

      if (previousDecision) {
        const currentlyHiked = previousDecision.isHiked ?? false;
        const currentCount = previousDecision.hikeCount ?? previousDecision.likeCount ?? 0;
        const newCount = currentlyHiked ? Math.max(0, currentCount - 1) : currentCount + 1;

        queryClient.setQueryData<DecisionResponse>(["decisions", "detail", decisionId], {
          ...previousDecision,
          isHiked: !currentlyHiked,
          likeCount: newCount,
          hikeCount: newCount,
        });
      }

      return { previousDecision };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousDecision) {
        queryClient.setQueryData(["decisions", "detail", decisionId], context.previousDecision);
      }
      toast.error(err?.response?.data?.message || err.message || "Failed to update hike");
    },
    onSuccess: (data: HikeResponse) => {
      queryClient.setQueryData<DecisionResponse | undefined>(
        ["decisions", "detail", decisionId],
        (old) => (old ? { ...old, isHiked: data.isHiked, likeCount: data.hikeCount, hikeCount: data.hikeCount } : undefined)
      );

      // Update all paginated decision queries in cache so feed items immediately reflect the new count and state
      queryClient.setQueriesData({ queryKey: ["decisions"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.content && Array.isArray(oldData.content)) {
          return {
            ...oldData,
            content: oldData.content.map((item: any) =>
              item.decisionId === decisionId
                ? { ...item, isHiked: data.isHiked, likeCount: data.hikeCount, hikeCount: data.hikeCount }
                : item
            ),
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((item: any) =>
            item.decisionId === decisionId
              ? { ...item, isHiked: data.isHiked, likeCount: data.hikeCount, hikeCount: data.hikeCount }
              : item
          );
        }
        return oldData;
      });

      // Invalidate feeds so counts and hike state stay synchronized
      queryClient.invalidateQueries({ queryKey: ["decisions", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["decisions", "popular"] });
      queryClient.invalidateQueries({ queryKey: ["decisions", "latest"] });
      queryClient.invalidateQueries({ queryKey: ["decisions", "search"] });
    },
  });
};
