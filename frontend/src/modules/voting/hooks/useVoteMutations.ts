import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteApi } from "../api/voteApi";
import { VoteRequest, VoteResponse } from "../types/vote";
import { toast } from "sonner";

export function useVoteMutations() {
  const queryClient = useQueryClient();

  const invalidateVoteQueries = (decisionId: number) => {
    queryClient.invalidateQueries({ queryKey: ["voteResults", decisionId] });
    queryClient.invalidateQueries({ queryKey: ["userVote", decisionId] });
    queryClient.invalidateQueries({ queryKey: ["userVote"] });
    queryClient.invalidateQueries({ queryKey: ["myVotes"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "detail", decisionId] });
    queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
    queryClient.invalidateQueries({ queryKey: ["decisions"] });
    queryClient.invalidateQueries({ queryKey: ["recentDecisions"] });
    queryClient.invalidateQueries({ queryKey: ["trendingDecisions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const castVote = useMutation({
    mutationFn: (request: VoteRequest) => voteApi.castVote(request),
    onSuccess: (data) => {
      invalidateVoteQueries(data.decisionId);
      toast.success("Vote submitted", {
        description: "Your vote has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Error submitting vote", {
        description: error.response?.data?.message || "Failed to record your vote.",
      });
    }
  });

  const castAnonymousVote = useMutation({
    mutationFn: (request: VoteRequest) => voteApi.castAnonymousVote(request),
    onSuccess: (data) => {
      invalidateVoteQueries(data.decisionId);
      toast.success("Anonymous vote submitted", {
        description: "Your vote has been recorded anonymously.",
      });
    },
    onError: (error: any) => {
      toast.error("Error submitting vote", {
        description: error.response?.data?.message || "Failed to record your vote.",
      });
    }
  });

  const changeVote = useMutation({
    mutationFn: ({ voteId, request }: { voteId: number; request: VoteRequest }) => 
      voteApi.changeVote(voteId, request),
    onSuccess: (data) => {
      invalidateVoteQueries(data.decisionId);
      toast.success("Vote updated", {
        description: "Your vote has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast.error("Error updating vote", {
        description: error.response?.data?.message || "Failed to update your vote.",
      });
    }
  });

  return {
    castVote,
    castAnonymousVote,
    changeVote
  };
}

