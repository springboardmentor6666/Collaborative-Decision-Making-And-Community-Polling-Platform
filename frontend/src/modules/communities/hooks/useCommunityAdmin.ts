import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "../api/communityApi";
import { MemberRole } from "../types/community";

export const useCommunityMembers = (communityId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: ["community-members", communityId, page, size],
    queryFn: () => communityApi.getMembers(communityId, { page, size }),
    enabled: !!communityId,
  });
};

export const usePendingRequests = (communityId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: ["community-pending-requests", communityId, page, size],
    queryFn: () => communityApi.getPendingRequests(communityId, { page, size }),
    enabled: !!communityId,
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) =>
      communityApi.approveRequest(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-pending-requests", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) =>
      communityApi.rejectRequest(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-pending-requests", variables.communityId] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId, role }: { communityId: number; userId: number; role: MemberRole }) =>
      communityApi.updateMemberRole(communityId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) =>
      communityApi.removeMember(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
    },
  });
};

export const useInviteUser = () => {
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) =>
      communityApi.inviteUser(communityId, userId),
  });
};
