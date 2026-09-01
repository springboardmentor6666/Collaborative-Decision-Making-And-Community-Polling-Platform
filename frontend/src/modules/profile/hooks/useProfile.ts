import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, UpdateProfileRequest } from '../api/profileApi';
import { UserResponse, DecisionResponse, PagedResponse } from '../../../types';
import { toast } from 'sonner';

export const useProfile = () => {
  return useQuery<UserResponse, Error>({
    queryKey: ['profile', 'me'],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile', 'me'], updatedUser);
      // Also update auth context if needed, usually just invalidating is enough
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => profileApi.deleteAccount(),
  });
};

export const useSavedDecisions = (page = 0, size = 10) => {
  return useQuery<PagedResponse<DecisionResponse>, Error>({
    queryKey: ['saved-decisions', page, size],
    queryFn: () => profileApi.getSavedDecisions(page, size),
  });
};

export const useSaveDecision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decisionId: number) => profileApi.saveDecision(decisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-decisions'] });
      queryClient.invalidateQueries({ queryKey: ['decisions', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success("Decision saved to bookmarks");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save decision");
    }
  });
};

export const useUnsaveDecision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decisionId: number) => profileApi.unsaveDecision(decisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-decisions'] });
      queryClient.invalidateQueries({ queryKey: ['decisions', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success("Decision removed from saved items");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove decision from saved items");
    }
  });
};
