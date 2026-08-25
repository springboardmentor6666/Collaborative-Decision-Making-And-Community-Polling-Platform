import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveDecisionApi, unsaveDecisionApi } from '../api/axiosClient';
import CategoryBadge from './CategoryBadge';

export default function DecisionCard({ decision, isSavedInitially = false, onBookmarkToggled = null }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitially || Boolean(decision.isSaved));
  const [saving, setSaving] = useState(false);

  const isOpen = decision.status === 'OPEN' || decision.status === 'Active' || decision.status === 'ACTIVE';
  const isClosed = decision.status === 'CLOSED' || decision.status === 'Completed' || decision.status === 'COMPLETED';

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !accessToken || saving) return;

    const previousState = isSaved;
    setIsSaved(!previousState);
    setSaving(true);

    try {
      if (!previousState) {
        await saveDecisionApi(decision.id, accessToken);
      } else {
        await unsaveDecisionApi(decision.id, accessToken);
      }
      if (onBookmarkToggled) {
        onBookmarkToggled(decision.id, !previousState);
      }
    } catch (err) {
      // Rollback on error
      setIsSaved(previousState);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      to={`/decisions/${decision.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-border-default bg-surface p-5 shadow-sm transition hover:border-primary-soft hover:shadow-md h-full min-w-0 overflow-hidden"
    >
      <div>
        {/* Top Badges + Bookmark Button */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: isOpen ? 'var(--status-open-bg)' : isClosed ? 'var(--status-closed-bg)' : 'var(--surface-alt)',
                color: isOpen ? 'var(--status-open-text)' : isClosed ? 'var(--status-closed-text)' : 'var(--text-secondary)',
              }}
            >
              {decision.status}
            </span>
            {decision.categoryName && (
              <CategoryBadge name={decision.categoryName} size="xs" />
            )}
            {decision.communityName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
                👥 {decision.communityName}
              </span>
            )}
          </div>

          {/* Bookmark / Save Button */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={saving}
              className={`rounded-xl p-1.5 transition ${
                isSaved
                  ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-muted hover:text-text-primary hover:bg-surface-alt'
              }`}
              title={isSaved ? 'Remove from Saved Decisions' : 'Save / Bookmark Decision'}
            >
              <svg
                className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="mb-3 flex items-start justify-between gap-3 min-w-0">
          <h3 className="text-base font-bold text-text-primary transition group-hover:text-primary min-w-0 flex-1 break-words [overflow-wrap:anywhere] line-clamp-2">
            {decision.title}
          </h3>
        </div>

        {decision.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted break-words [overflow-wrap:anywhere]">{decision.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-2 border-t border-border-default/40 mt-auto">
        {decision.votesCount !== undefined && (
          <span className="flex items-center gap-1 shrink-0">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {decision.votesCount} vote{decision.votesCount !== 1 ? 's' : ''}
          </span>
        )}
        {decision.optionsCount !== undefined && decision.optionsCount > 0 && (
          <span className="shrink-0">{decision.optionsCount} options</span>
        )}
        {decision.comparisonFactors && decision.comparisonFactors.length > 0 && (
          <span className="shrink-0 text-purple-600 dark:text-purple-400 font-semibold">
            📊 MCDA ({decision.comparisonFactors.length} factors)
          </span>
        )}
      </div>
    </Link>
  );
}
