import { useQuery } from "@tanstack/react-query";
import { communityApi } from "../api/communityApi";

export const useCommunity = (id: number) => {
  return useQuery({
    queryKey: ["communities", "detail", id],
    queryFn: () => communityApi.getCommunityById(id),
    enabled: !!id,
  });
};

export const useCommunityMembers = (id: number, params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["communities", "members", id, params],
    queryFn: () => communityApi.getMembers(id, params),
    enabled: !!id,
  });
};

export const useCommunityRequests = (id: number, params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["communities", "requests", id, params],
    queryFn: () => communityApi.getPendingRequests(id, params),
    enabled: !!id,
  });
};

export const useCommunityMembership = (id: number) => {
  return useQuery({
    queryKey: ["communities", "membership", id],
    queryFn: () => communityApi.getMembership(id),
    enabled: !!id,
  });
};
