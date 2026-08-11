import React, { Fragment } from 'react';
import { useComments } from '../hooks/useComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { CommentCard } from './CommentCard';
import { CommentEditor } from './CommentEditor';
import { CommentSkeleton } from './CommentSkeleton';
import { Button } from '../../../components/ui/button';
import { MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  decisionId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ decisionId }) => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments(decisionId);

  const createCommentMutation = useCreateComment();

  const handleSubmit = (message: string) => {
    createCommentMutation.mutate({ decisionId, message });
  };

  if (isError) {
    return (
      <div className="py-8 text-center text-destructive">
        Failed to load discussions. Please try again later.
      </div>
    );
  }

  const allComments = data?.pages.flatMap((page) => page.content) || [];
  const commentCount = allComments.length; // Actually total count could be fetched from page.totalElements, but let's just use what's loaded or display simple header.
  
  const totalComments = data?.pages[0]?.totalElements || 0;

  return (
    <div className="mt-12 border-t border-border/50 pt-8">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Discussion</h3>
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm font-medium ml-2">
          {totalComments}
        </span>
      </div>

      <div className="mb-8">
        <CommentEditor
          onSubmit={handleSubmit}
          isSubmitting={createCommentMutation.isPending}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : allComments.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h4 className="text-lg font-medium text-foreground mb-1">No Discussions Yet</h4>
            <p className="text-muted-foreground text-sm">Be the first person to share your thoughts.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 border border-border/50 rounded-xl overflow-hidden bg-card">
            {allComments.map((comment) => (
              <CommentCard key={comment.commentId} comment={comment} decisionId={decisionId} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load older comments'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
