import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCommentFilesApi } from '../api/axiosClient';
import ReportModal from './ReportModal';

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
  const [attachments, setAttachments] = useState(comment.attachments || []);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (comment.id && !comment.attachments) {
      getCommentFilesApi(comment.id)
        .then((files) => {
          if (Array.isArray(files) && files.length > 0) {
            setAttachments(files);
          }
        })
        .catch(() => {});
    }
  }, [comment.id, comment.attachments]);

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
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author.email || author.name || 'user')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`space-y-3 ${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-border-default pl-3 sm:pl-4' : ''}`}
    >
      <div className="rounded-2xl border border-border-default bg-surface p-4 shadow-sm transition hover:border-primary-soft">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={avatarUrl}
              alt={author.name || 'User'}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-surface-alt object-cover border border-border-default shrink-0"
              loading="lazy"
            />
            <div className="min-w-0 flex flex-wrap items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-text-primary truncate">
                {author.name || 'Anonymous User'}
              </span>
              {author.role && author.role !== 'USER' && (
                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {author.role}
                </span>
              )}
              {comment.isExpert && (
                <span
                  className="rounded-md bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5"
                  title="Structured Expert Recommendation"
                >
                  🏅 Expert Advice
                </span>
              )}
              {comment.isSuggestion && (
                <span
                  className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5"
                  title="Structured Suggestion"
                >
                  💡 Suggestion
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-muted">
                • {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions: Edit, Delete, Report */}
          <div className="flex items-center gap-1 shrink-0 text-xs">
            {isAuthor && !isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditText(comment.content || '');
                    setIsEditing(true);
                  }}
                  className="px-2 py-1 rounded-lg font-semibold text-secondary hover:text-text-primary hover:bg-surface-alt transition"
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
              </>
            )}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-500/10 transition"
              title="Report this comment"
            >
              🚩
            </button>
          </div>
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
          <div className="mt-2 space-y-2 pl-9 sm:pl-10">
            <p className="text-xs sm:text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed">
              {comment.content}
            </p>

            {/* Comment Attachments */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 pt-1">
                {attachments.map((att) => {
                  const isImg = att.fileType?.startsWith('image/') || att.filename?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                  return (
                    <a
                      key={att.id}
                      href={att.fileUrl || `/api/files/download/${att.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-text-primary hover:border-primary transition"
                    >
                      <span>{isImg ? '🖼️' : '📄'}</span>
                      <span className="truncate max-w-[130px]">{att.filename}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="COMMENT"
        targetId={comment.id}
        targetTitle={comment.content}
      />
    </motion.div>
  );
}
