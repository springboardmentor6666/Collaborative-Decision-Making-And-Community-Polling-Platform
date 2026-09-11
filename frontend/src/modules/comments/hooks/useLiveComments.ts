import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useWebSocketTopic } from '@/hooks/useWebSocketTopic';
import { CommentResponse } from '@/modules/comments/types/comment';
import { PagedResponse } from '@/types';

/**
 * Hook that listens for real-time new and updated comments on a decision discussion.
 * Injects incoming comments directly into TanStack Query infinite pages cache.
 */
export function useLiveComments(decisionId: number | undefined | null) {
  const queryClient = useQueryClient();

  useWebSocketTopic<CommentResponse>(
    decisionId ? `/topic/decisions/${decisionId}/comments` : null,
    (incomingComment) => {
      if (!incomingComment || !decisionId) return;

      queryClient.setQueryData<InfiniteData<PagedResponse<CommentResponse>>>(
        ['comments', decisionId],
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            // If no cache exists yet, invalidate so it loads properly
            queryClient.invalidateQueries({ queryKey: ['comments', decisionId] });
            return oldData;
          }

          // Check if comment already exists (e.g. edited comment)
          let exists = false;
          const updatedPages = oldData.pages.map((page) => {
            const index = page.content.findIndex(
              (c) => c.commentId === incomingComment.commentId
            );
            if (index !== -1) {
              exists = true;
              const newContent = [...page.content];
              newContent[index] = incomingComment;
              return { ...page, content: newContent };
            }
            return page;
          });

          if (exists) {
            return { ...oldData, pages: updatedPages };
          }

          // If new top-level or reply comment, prepend to first page
          const firstPage = oldData.pages[0];
          const newFirstPage = {
            ...firstPage,
            content: [incomingComment, ...firstPage.content],
            totalElements: (firstPage.totalElements || 0) + 1,
          };

          return {
            ...oldData,
            pages: [newFirstPage, ...oldData.pages.slice(1)],
          };
        }
      );
    }
  );
}
