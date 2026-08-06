import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';
import { toast } from 'sonner';

export const useDeleteComment = (decisionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', decisionId] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment. Please try again.');
    },
  });
};
