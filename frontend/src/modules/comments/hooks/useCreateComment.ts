import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';
import { CommentRequest } from '../types/comment';
import { toast } from 'sonner';

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentRequest) => commentApi.createComment(data),
    onSuccess: (_, variables) => {
      // Invalidate the comments list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['comments', variables.decisionId] });
      toast.success(variables.parentCommentId ? 'Reply posted!' : 'Comment posted!');
    },
    onError: () => {
      toast.error('Failed to post comment. Please try again.');
    },
  });
};
