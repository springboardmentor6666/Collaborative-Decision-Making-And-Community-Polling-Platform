import { useQuery } from "@tanstack/react-query";
import { communityApi } from "../api/communityApi";
import { CommunityVisibility } from "../types/community";

export const useCommunities = (
  params: { query?: string; visibility?: CommunityVisibility; ownerId?: number; page?: number; size?: number }
) => {
  return useQuery({
    queryKey: ["communities", "search", params],
    queryFn: () => communityApi.searchCommunities(params),
  });
};

export const useMyCommunities = (params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["communities", "my", params],
    queryFn: () => communityApi.getMyCommunities(params),
  });
};
