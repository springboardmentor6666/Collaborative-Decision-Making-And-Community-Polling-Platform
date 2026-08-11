import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';
import { toast } from 'sonner';

export const useUpdateComment = (decisionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, message }: { commentId: number; message: string }) =>
      commentApi.updateComment(commentId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', decisionId] });
      toast.success('Comment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update comment. Please try again.');
    },
  });
};
