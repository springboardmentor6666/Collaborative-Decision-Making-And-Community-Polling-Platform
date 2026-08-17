import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

export default function DecisionCard({ decision }) {
  const isOpen = decision.status === 'OPEN' || decision.status === 'Active' || decision.status === 'ACTIVE';
  const isClosed = decision.status === 'CLOSED' || decision.status === 'Completed' || decision.status === 'COMPLETED';

  return (
    <Link
      to={`/decisions/${decision.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border-default bg-surface p-5 shadow-sm transition hover:border-primary-soft hover:shadow-md h-full min-w-0 overflow-hidden"
    >
      <div>
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
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
