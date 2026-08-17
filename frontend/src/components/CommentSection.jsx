import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getCommentsByDecisionApi,
  createCommentApi,
  replyToCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from '../api/axiosClient';
import CommentItem from './CommentItem';

function countAllComments(commentsList) {
  let count = 0;
  function traverse(list) {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      count++;
      if (item.replies && item.replies.length > 0) {
        traverse(item.replies);
      }
    }
  }
  traverse(commentsList);
  return count;
}

export default function CommentSection({ decisionId }) {
  const { user, accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!decisionId) return;
    try {
      setError(null);
      const data = await getCommentsByDecisionApi(decisionId, accessToken);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [decisionId, accessToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createCommentApi(
        {
          decisionId: Number(decisionId),
          content: newComment.trim(),
        },
        accessToken
      );
      setNewComment('');
      await fetchComments();
    } catch (err) {
      alert(err.message || 'Failed to post comment. Please sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    await replyToCommentApi(
      parentCommentId,
      {
        decisionId: Number(decisionId),
        content,
      },
      accessToken
    );
    await fetchComments();
  };

  const handleEdit = async (commentId, content) => {
    await updateCommentApi(commentId, { content }, accessToken);
    await fetchComments();
  };

  const handleDelete = async (commentId) => {
    await deleteCommentApi(commentId, accessToken);
    await fetchComments();
  };

  const totalComments = countAllComments(comments);

  return (
    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border-default pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-text-primary">
              Discussion & Insights
            </h3>
            <p className="text-xs text-secondary">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'} on this decision
            </p>
          </div>
        </div>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handlePostComment(e);
              }
            }}
            rows={3}
            disabled={!user}
            placeholder={
              user
                ? 'Share your perspective, rationale, or alternative considerations... (Ctrl+Enter to post)'
                : 'Sign in to join the discussion...'
            }
            className="app-input px-4 py-3 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted">
            {user ? 'Markdown formatting supported' : 'Authentication required'}
          </span>
          <button
            type="submit"
            disabled={submitting || !newComment.trim() || !user}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-contrast, #ffffff)',
            }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold shadow-app transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4 pt-2">
          {[1, 2].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-border-default bg-surface-alt/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-border-default/60" />
                <div className="h-3.5 w-28 rounded-md bg-border-default/60" />
              </div>
              <div className="h-3 w-full rounded-md bg-border-default/40 ml-9" />
              <div className="h-3 w-4/5 rounded-md bg-border-default/30 ml-9" />
            </div>
          ))}
        </div>
      )}

      {/* Comments List */}
      {!loading && (
        <div className="pt-2">
          {comments.length === 0 ? (
            <div className="py-8 text-center rounded-2xl border border-dashed border-border-default bg-surface-alt/30">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm font-bold text-text-primary">No comments yet</p>
              <p className="text-xs text-secondary mt-1">
                Start the conversation by sharing your thoughts or feedback above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    currentUserEmail={user?.email}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
