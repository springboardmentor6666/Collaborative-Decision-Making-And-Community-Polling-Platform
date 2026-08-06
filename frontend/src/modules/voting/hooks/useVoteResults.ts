import { useQuery } from "@tanstack/react-query";
import { voteApi } from "../api/voteApi";
import { VoteResultResponse } from "../types/vote";

export function useVoteResults(decisionId: number) {
  return useQuery<VoteResultResponse, Error>({
    queryKey: ["voteResults", decisionId],
    queryFn: () => voteApi.getVoteResults(decisionId),
    enabled: !!decisionId,
    // Automatically refetch every 15 seconds to keep results live
    refetchInterval: 15000,
  });
}
