import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "../api/communityApi";
import { CommunityRequest, MemberRole } from "../types/community";

export const useCommunityMutations = () => {
  const queryClient = useQueryClient();

  const invalidateCommunityLists = () => {
    queryClient.invalidateQueries({ queryKey: ["communities", "search"] });
    queryClient.invalidateQueries({ queryKey: ["communities", "my"] });
  };

  const createCommunity = useMutation({
    mutationFn: (data: CommunityRequest) => communityApi.createCommunity(data),
    onSuccess: () => {
      invalidateCommunityLists();
    },
  });

  const updateCommunity = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CommunityRequest }) => communityApi.updateCommunity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "detail", variables.id] });
      invalidateCommunityLists();
    },
  });

  const deleteCommunity = useMutation({
    mutationFn: (id: number) => communityApi.deleteCommunity(id),
    onSuccess: () => {
      invalidateCommunityLists();
    },
  });

  const joinCommunity = useMutation({
    mutationFn: (id: number) => communityApi.joinCommunity(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["communities", "members", id] });
      queryClient.invalidateQueries({ queryKey: ["communities", "membership", id] });
      invalidateCommunityLists();
    },
  });

  const leaveCommunity = useMutation({
    mutationFn: (id: number) => communityApi.leaveCommunity(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["communities", "members", id] });
      queryClient.invalidateQueries({ queryKey: ["communities", "membership", id] });
      invalidateCommunityLists();
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: ({ communityId, userId, role }: { communityId: number; userId: number; role: MemberRole }) => 
      communityApi.updateMemberRole(communityId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "members", variables.communityId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) => 
      communityApi.removeMember(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "members", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["communities", "detail", variables.communityId] });
    },
  });

  const approveRequest = useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) => 
      communityApi.approveRequest(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "requests", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["communities", "members", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["communities", "detail", variables.communityId] });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) => 
      communityApi.rejectRequest(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "requests", variables.communityId] });
    },
  });

  const inviteUser = useMutation({
    mutationFn: ({ communityId, userId }: { communityId: number; userId: number }) => 
      communityApi.inviteUser(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["communities", "members", variables.communityId] });
    },
  });

  return {
    createCommunity,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    updateMemberRole,
    removeMember,
    approveRequest,
    rejectRequest,
    inviteUser,
  };
};
