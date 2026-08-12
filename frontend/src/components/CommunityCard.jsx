import { Link } from 'react-router-dom';

export default function CommunityCard({ community }) {
  const isPublic = community.visibility === 'PUBLIC' || community.visibility === 'Public';

  return (
    <Link
      to={`/communities/${community.id}`}
      className="group block rounded-2xl border border-border-default bg-surface p-5 shadow-sm transition hover:border-primary-soft hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-text-primary transition group-hover:text-primary break-words">
          {community.name}
        </h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: isPublic ? 'var(--status-open-bg)' : 'var(--status-closed-bg)',
            color: isPublic ? 'var(--status-open-text)' : 'var(--status-closed-text)',
          }}
        >
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {community.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted">{community.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted">
        {community.memberCount !== undefined && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
          </span>
        )}
        {community.decisionCount !== undefined && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {community.decisionCount} decision{community.decisionCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  );
}
