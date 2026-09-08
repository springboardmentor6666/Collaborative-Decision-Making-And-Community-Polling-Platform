import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import { ChangePasswordRequest, UserPreferences, UserPreferencesRequest, UserDataExportResponse } from '../../../types';
import { toast } from 'sonner';

export const useUserPreferences = () => {
  return useQuery<UserPreferences, Error>({
    queryKey: ['user-preferences'],
    queryFn: settingsApi.getPreferences,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserPreferencesRequest) => settingsApi.updatePreferences(data),
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(['user-preferences'], updatedPrefs);
      toast.success('Preferences saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update preferences');
    }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  });
};

export const useExportUserData = () => {
  return useMutation({
    mutationFn: settingsApi.exportUserData,
    onSuccess: (data: UserDataExportResponse) => {
      // Create downloadable JSON blob
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `decisionhub_export_${data.profile.username || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Your data package has been downloaded');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to export account data');
    }
  });
};
