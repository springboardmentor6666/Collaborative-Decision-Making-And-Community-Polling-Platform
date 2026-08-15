import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CommentItem({
  comment,
  currentUserId,
  currentUserEmail,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const author = comment.author || {};
  const isAuthor =
    (currentUserId && author.id === currentUserId) ||
    (currentUserEmail && author.email?.toLowerCase() === currentUserEmail.toLowerCase());

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;
    try {
      setSubmittingReply(true);
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || submittingEdit) return;
    try {
      setSubmittingEdit(true);
      await onEdit(comment.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update comment');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await onDelete(comment.id);
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  const avatarUrl =
    author.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author.email || author.name || 'User')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`relative ${depth > 0 ? 'ml-3 sm:ml-7 mt-3 pl-3 sm:pl-4 border-l-2 border-primary/20' : 'mt-3'}`}
    >
      <div className="rounded-2xl border border-border-default bg-surface-alt/60 p-4 shadow-xs transition-all hover:border-primary-soft">
        {/* Header: Author info & actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={avatarUrl}
              alt={author.name || 'User'}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border-default object-cover shrink-0 bg-surface"
            />
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm text-text-primary truncate block">
                {author.name || author.fullName || author.email?.split('@')[0] || 'Community Member'}
              </span>
              <span className="text-[11px] text-secondary block">
                {formatRelativeTime(comment.createdAt)}
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1 italic text-[10px] text-secondary/80">(edited)</span>
                )}
              </span>
            </div>
          </div>

          {/* Author Actions */}
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-1 shrink-0 text-xs">
              <button
                onClick={() => {
                  setEditText(comment.content || '');
                  setIsEditing(true);
                }}
                className="px-2 py-1 rounded-lg font-semibold text-secondary hover:text-text-primary hover:bg-surface transition"
                title="Edit comment"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-2 py-1 rounded-lg font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition"
                title="Delete comment"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="app-input px-3 py-2 text-xs sm:text-sm"
              placeholder="Edit your comment..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-3 py-1 text-xs font-semibold text-secondary hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEdit}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-contrast, #ffffff)',
                }}
                className="rounded-xl px-3.5 py-1 text-xs font-bold shadow-app hover:opacity-90 disabled:opacity-50"
              >
                {submittingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs sm:text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed pl-9 sm:pl-10">
            {comment.content}
          </p>
        )}

        {/* Reply Action */}
        {!isEditing && depth < 3 && (
          <div className="mt-2 flex items-center justify-end pl-9 sm:pl-10">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
        )}

        {/* Nested Reply Form */}
        <AnimatePresence>
          {isReplying && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReplySubmit}
              className="mt-3 pl-9 sm:pl-10 space-y-2 overflow-hidden"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="app-input px-3 py-2 text-xs sm:text-sm"
                placeholder={`Reply to ${author.name || 'this comment'}...`}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="rounded-xl px-3 py-1 text-xs font-semibold text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-contrast, #ffffff)',
                  }}
                  className="rounded-xl px-3.5 py-1 text-xs font-bold shadow-app hover:opacity-90 disabled:opacity-50"
                >
                  {submittingReply ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Render Nested Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
