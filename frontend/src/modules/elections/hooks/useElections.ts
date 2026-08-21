import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { electionsApi } from "../api/electionsApi";
import { ElectionVoteRequest, VotingEventRequest, VotingCategoryRequest, NomineeRequest } from "../types";

export const useCommunityElections = (communityId: number) => {
  return useQuery({
    queryKey: ["elections", "community", communityId],
    queryFn: () => electionsApi.getCommunityElections(communityId),
    enabled: !!communityId,
  });
};

export const useElection = (eventId: number) => {
  return useQuery({
    queryKey: ["elections", "detail", eventId],
    queryFn: () => electionsApi.getElectionById(eventId),
    enabled: !!eventId,
  });
};

export const useElectionCategories = (eventId: number) => {
  return useQuery({
    queryKey: ["elections", "categories", eventId],
    queryFn: () => electionsApi.getElectionCategories(eventId),
    enabled: !!eventId,
  });
};

export const useCategoryNominees = (categoryId: number) => {
  return useQuery({
    queryKey: ["elections", "nominees", categoryId],
    queryFn: () => electionsApi.getCategoryNominees(categoryId),
    enabled: !!categoryId,
  });
};

export const useSubmitVote = () => {
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: ElectionVoteRequest }) =>
      electionsApi.submitVote(categoryId, data),
  });
};

// --- Management Hooks ---

export const useCreateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, data }: { communityId: number; data: VotingEventRequest }) =>
      electionsApi.createElection(communityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "community", variables.communityId] });
    },
  });
};

export const useUpdateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: VotingEventRequest }) =>
      electionsApi.updateElection(eventId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "detail", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
    },
  });
};

export const usePublishElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => electionsApi.publishElection(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "detail", eventId] });
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
    },
  });
};

export const useStartElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => electionsApi.startElection(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "detail", eventId] });
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
    },
  });
};

export const useCloseElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => electionsApi.closeElection(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "detail", eventId] });
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
    },
  });
};

export const useDeleteElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => electionsApi.deleteElection(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
    },
  });
};

export const usePublishResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => electionsApi.publishResults(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "detail", eventId] });
      queryClient.invalidateQueries({ queryKey: ["elections", "community"] });
      queryClient.invalidateQueries({ queryKey: ["elections", "results", eventId] });
    },
  });
};

export const useElectionResults = (eventId: number) => {
  return useQuery({
    queryKey: ["elections", "results", eventId],
    queryFn: () => electionsApi.getElectionResults(eventId),
    enabled: !!eventId,
    retry: false, // Don't retry on 403 Forbidden
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: VotingCategoryRequest }) =>
      electionsApi.createCategory(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "categories", variables.eventId] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, categoryId, data }: { eventId: number; categoryId: number; data: VotingCategoryRequest }) =>
      electionsApi.updateCategory(eventId, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "categories", variables.eventId] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, categoryId }: { eventId: number; categoryId: number }) =>
      electionsApi.deleteCategory(eventId, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "categories", variables.eventId] });
    },
  });
};

export const useSubmitNominee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: NomineeRequest }) =>
      electionsApi.submitNominee(categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "nominees", variables.categoryId] });
    },
  });
};

export const useApproveNomination = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, nomineeId }: { categoryId: number; nomineeId: number }) =>
      electionsApi.approveNomination(nomineeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "nominees", variables.categoryId] });
    },
  });
};

export const useRejectNomination = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, nomineeId }: { categoryId: number; nomineeId: number }) =>
      electionsApi.rejectNomination(nomineeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["elections", "nominees", variables.categoryId] });
    },
  });
};
