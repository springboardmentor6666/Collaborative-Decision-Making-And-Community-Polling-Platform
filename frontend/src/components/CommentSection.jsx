import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getCommentsByDecisionApi,
  createCommentApi,
  replyToCommentApi,
  updateCommentApi,
  deleteCommentApi,
  getSuggestionsApi,
  createSuggestionApi,
  getRecommendationsApi,
  createRecommendationApi,
  uploadCommentFileApi,
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

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / 60000);
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffHours = Math.floor(diffInMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function CommentSection({ decisionId, pollOptions = [] }) {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('COMMENTS'); // 'COMMENTS' | 'SUGGESTIONS' | 'RECOMMENDATIONS'
  
  // Comments State
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [justification, setJustification] = useState('');
  const [submittingRec, setSubmittingRec] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!decisionId) return;
    try {
      setError(null);
      const data = await getCommentsByDecisionApi(decisionId, accessToken);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    }
  }, [decisionId, accessToken]);

  const fetchSuggestions = useCallback(async () => {
    if (!decisionId) return;
    try {
      const data = await getSuggestionsApi(decisionId, accessToken);
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, [decisionId, accessToken]);

  const fetchRecommendations = useCallback(async () => {
    if (!decisionId) return;
    try {
      const data = await getRecommendationsApi(decisionId, accessToken);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  }, [decisionId, accessToken]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchComments(), fetchSuggestions(), fetchRecommendations()]);
    setLoading(false);
  }, [fetchComments, fetchSuggestions, fetchRecommendations]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Set of expert user emails from recommendations
  const expertEmails = new Set(
    recommendations.map((r) => r.expert?.email?.toLowerCase()).filter(Boolean)
  );

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const created = await createCommentApi(
        {
          decisionId: Number(decisionId),
          content: newComment.trim(),
        },
        accessToken
      );
      if (created?.id && commentFile) {
        try {
          await uploadCommentFileApi(created.id, commentFile, accessToken);
        } catch (fErr) {
          console.error('Failed to attach comment file:', fErr);
        }
      }
      setNewComment('');
      setCommentFile(null);
      await fetchComments();
    } catch (err) {
      alert(err.message || 'Failed to post comment. Please sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim() || submittingSuggestion) return;

    try {
      setSubmittingSuggestion(true);
      await createSuggestionApi(
        {
          decisionId: Number(decisionId),
          content: newSuggestion.trim(),
        },
        accessToken
      );
      setNewSuggestion('');
      await fetchSuggestions();
    } catch (err) {
      alert(err.message || 'Failed to post suggestion.');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const handlePostRecommendation = async (e) => {
    e.preventDefault();
    if (!selectedOptionId || !justification.trim() || submittingRec) return;

    try {
      setSubmittingRec(true);
      await createRecommendationApi(
        {
          decisionId: Number(decisionId),
          recommendedOptionId: Number(selectedOptionId),
          justification: justification.trim(),
        },
        accessToken
      );
      setSelectedOptionId('');
      setJustification('');
      await fetchRecommendations();
    } catch (err) {
      alert(err.message || 'Failed to submit expert recommendation.');
    } finally {
      setSubmittingRec(false);
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
      {/* Header & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-4">
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
              Community perspectives, structured suggestions, and expert advice
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border-default bg-surface-alt p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('COMMENTS')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'COMMENTS'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-muted hover:text-text-primary'
            }`}
          >
            Discussions ({totalComments})
          </button>
          <button
            onClick={() => setActiveTab('SUGGESTIONS')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'SUGGESTIONS'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-muted hover:text-text-primary'
            }`}
          >
            💡 Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'RECOMMENDATIONS'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-muted hover:text-text-primary'
            }`}
          >
            🏅 Expert Advice ({recommendations.length})
          </button>
        </div>
      </div>

      {/* TAB 1: COMMENTS */}
      {activeTab === 'COMMENTS' && (
        <div className="space-y-4">
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

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-default bg-surface-alt px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary transition">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>Attach File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setCommentFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>

                {commentFile && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs text-primary font-medium">
                    <span className="truncate max-w-[120px]">{commentFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCommentFile(null)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

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
                    {comments.map((comment) => {
                      const isAuthorExpert =
                        expertEmails.has(comment.author?.email?.toLowerCase()) ||
                        Boolean(comment.isExpert);

                      return (
                        <CommentItem
                          key={comment.id}
                          comment={{ ...comment, isExpert: isAuthorExpert }}
                          currentUserId={user?.id}
                          currentUserEmail={user?.email}
                          onReply={handleReply}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUGGESTIONS */}
      {activeTab === 'SUGGESTIONS' && (
        <div className="space-y-4">
          <form onSubmit={handlePostSuggestion} className="space-y-3">
            <textarea
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              rows={3}
              disabled={!user}
              placeholder={
                user
                  ? 'Submit a structured suggestion or alternative option for this decision board...'
                  : 'Sign in to submit a suggestion...'
              }
              className="app-input px-4 py-3 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingSuggestion || !newSuggestion.trim() || !user}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-app transition hover:opacity-90 disabled:opacity-50"
              >
                {submittingSuggestion ? 'Submitting...' : '💡 Submit Suggestion'}
              </button>
            </div>
          </form>

          {/* Suggestions List */}
          <div className="space-y-3 pt-2">
            {suggestions.length === 0 ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-border-default bg-surface-alt/30">
                <div className="text-3xl mb-2">💡</div>
                <p className="text-sm font-bold text-text-primary">No suggestions submitted yet</p>
                <p className="text-xs text-secondary mt-1">
                  Have an alternative option or actionable advice? Share a suggestion above.
                </p>
              </div>
            ) : (
              suggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="rounded-2xl border border-border-default bg-surface-alt/50 p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">
                        {sugg.user?.name || sugg.user?.fullName || sugg.user?.email || 'Contributor'}
                      </span>
                      <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Suggestion
                      </span>
                    </div>
                    <span className="text-[11px] text-muted">{formatRelativeTime(sugg.createdAt)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {sugg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXPERT RECOMMENDATIONS */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="space-y-4">
          {/* Post Recommendation Form if user has options */}
          <form onSubmit={handlePostRecommendation} className="space-y-3 rounded-2xl border border-border-default bg-surface-alt/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <span>🏅</span> Submit Expert Recommendation
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">
                  Recommended Option
                </label>
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  disabled={!user}
                  className="app-input w-full px-3 py-2 text-xs"
                  required
                >
                  <option value="">-- Choose Option --</option>
                  {pollOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.optionText || opt.label || `Option #${opt.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">
                  Expert Justification / Rationale
                </label>
                <input
                  type="text"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  disabled={!user}
                  placeholder="Key rationale, data, or domain experience..."
                  className="app-input w-full px-3 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingRec || !selectedOptionId || !justification.trim() || !user}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
              >
                {submittingRec ? 'Saving...' : '🏅 Post Expert Recommendation'}
              </button>
            </div>
          </form>

          {/* Recommendations List */}
          <div className="space-y-3 pt-2">
            {recommendations.length === 0 ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-border-default bg-surface-alt/30">
                <div className="text-3xl mb-2">🏅</div>
                <p className="text-sm font-bold text-text-primary">No expert recommendations yet</p>
                <p className="text-xs text-secondary mt-1">
                  Advisors and domain experts can weigh in with structured rationale above.
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">
                        {rec.expert?.name || rec.expert?.fullName || rec.expert?.email || 'Domain Advisor'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-500/30">
                        <span>🏅</span> Expert Choice
                      </span>
                    </div>
                    <span className="text-[11px] text-muted">{formatRelativeTime(rec.createdAt)}</span>
                  </div>

                  <div className="rounded-xl bg-surface border border-border-default p-3 text-xs">
                    <p className="font-bold text-primary">
                      Endorsement: {rec.recommendedOptionLabel || `Option #${rec.recommendedOptionId}`}
                    </p>
                    <p className="mt-1 text-text-primary leading-relaxed">{rec.justification}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

