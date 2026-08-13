import React, { useState } from 'react';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { CommentResponse } from '../types/comment';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { CommentEditor } from './CommentEditor';
import { useDeleteComment } from '../hooks/useDeleteComment';
import { useUpdateComment } from '../hooks/useUpdateComment';
import { useCreateComment } from '../hooks/useCreateComment';

interface CommentCardProps {
  comment: CommentResponse;
  decisionId: number;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, decisionId }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const deleteCommentMutation = useDeleteComment(decisionId);
  const updateCommentMutation = useUpdateComment(decisionId);
  const createCommentMutation = useCreateComment();

  const isAuthor = user?.userId === comment.user.userId;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const canModify = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(dateStr));
  };

  const handleReplySubmit = (message: string) => {
    createCommentMutation.mutate(
      { decisionId, parentCommentId: comment.commentId, message },
      { onSuccess: () => setIsReplying(false) }
    );
  };

  const handleEditSubmit = (message: string) => {
    updateCommentMutation.mutate(
      { commentId: comment.commentId, message },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(comment.commentId);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-shrink-0">
        <Avatar className="w-10 h-10 border border-[#E2E8F0]">
          <AvatarImage src={comment.user.profileImage} alt={comment.user.username || comment.user.fullName} />
          <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
             {getInitials(comment.user.fullName || comment.user.username)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#0F172A]">
            {comment.user.fullName || comment.user.username}
          </span>
          <span className="text-xs text-[#64748B]">
            {formatDate(comment.createdAt)}
          </span>
          {comment.edited && (
            <span className="text-xs text-[#64748B] italic">(edited)</span>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2">
            <CommentEditor
              initialValue={comment.message}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={updateCommentMutation.isPending}
              submitLabel="Save Changes"
            />
          </div>
        ) : (
          <p className="text-sm text-[#0F172A] whitespace-pre-wrap mt-1 leading-relaxed">
            {comment.message}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4 pt-2">
            {user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
            {canModify && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-[#64748B] hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-4 border-l-2 border-[#E2E8F0] pl-4">
            <CommentEditor
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              isSubmitting={createCommentMutation.isPending}
              placeholder={`Replying to ${comment.user.fullName || comment.user.username}...`}
              submitLabel="Reply"
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-[#E2E8F0] pl-2 sm:pl-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.commentId} comment={reply} decisionId={decisionId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
