/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ActivityItemCard.jsx
 * Architecture Tier: Activity Stream Component (UI Layer)
 * Path: frontend/src/components/activity/ActivityItemCard.jsx
 *
 * Purpose:
 *   Polymorphic activity item renderer formatting activity events (votes, comments, decisions, joins) with icons and action links.
 */

import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  UserPlus,
  CheckSquare,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

function getRelativeTime(dateString) {
  if (!dateString) return 'just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1m ago';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return past.toLocaleDateString();
}

function getActivityBadgeConfig(activityType) {
  switch (activityType) {
    case 'VOTE_CAST':
      return {
        icon: CheckCircle2,
        label: 'Cast a Vote',
        iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        verb: 'voted on',
      };
    case 'DECISION_CREATED':
      return {
        icon: PlusCircle,
        label: 'Created Poll',
        iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        verb: 'published decision',
      };
    case 'COMMENT_ADDED':
      return {
        icon: MessageSquare,
        label: 'Commented',
        iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
        verb: 'commented on',
      };
    case 'COMMUNITY_JOINED':
      return {
        icon: UserPlus,
        label: 'Joined Group',
        iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        verb: 'joined community',
      };
    case 'DECISION_CLOSED':
      return {
        icon: CheckSquare,
        label: 'Concluded Poll',
        iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        verb: 'concluded decision',
      };
    default:
      return {
        icon: Sparkles,
        label: 'Activity',
        iconBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30',
        verb: 'participated in',
      };
  }
}

export default function ActivityItemCard({ activity }) {
  if (!activity) return null;

  const actor = activity.actor || {};
  const actorName = actor.fullName || actor.name || actor.email || 'A community member';
  const avatarUrl =
    actor.profileImage ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(actor.email || actorName)}`;

  const config = getActivityBadgeConfig(activity.activityType);
  const IconComponent = config.icon;

  // Determine target navigation destination
  let targetUrl = '/dashboard';
  if (activity.entityType === 'DECISION' || activity.entityType === 'POLL' || activity.activityType === 'VOTE_CAST' || activity.activityType === 'DECISION_CREATED' || activity.activityType === 'DECISION_CLOSED' || activity.activityType === 'COMMENT_ADDED') {
    targetUrl = `/decisions/${activity.entityId}`;
  } else if (activity.entityType === 'COMMUNITY' || activity.activityType === 'COMMUNITY_JOINED') {
    targetUrl = `/communities/${activity.entityId || activity.communityId}`;
  } else if (activity.communityId) {
    targetUrl = `/communities/${activity.communityId}`;
  }

  return (
    <div className="group relative flex items-start gap-3.5 rounded-2xl border border-border-default bg-surface/90 p-3.5 shadow-xs transition-all duration-200 hover:border-primary-soft hover:bg-surface-alt/40 hover:shadow-sm">
      {/* Actor Avatar with Overlay Activity Icon Badge */}
      <div className="relative shrink-0 pt-0.5">
        <img
          src={avatarUrl}
          alt={actorName}
          className="h-9 w-9 rounded-2xl border border-border-default bg-surface-alt object-cover shadow-xs"
        />
        <div
          className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full shadow-xs ${config.iconBg}`}
          title={config.label}
        >
          <IconComponent className="h-2.5 w-2.5" />
        </div>
      </div>

      {/* Activity Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-primary leading-relaxed truncate">
            <strong className="font-bold text-text-primary">{actorName}</strong>{' '}
            <span className="text-muted">{config.verb}</span>
          </p>
          <span className="shrink-0 text-[10px] font-semibold text-muted">
            {getRelativeTime(activity.createdAt)}
          </span>
        </div>

        {/* Highlighted Entity Title Link */}
        <Link
          to={targetUrl}
          className="mt-0.5 inline-flex items-center gap-1 font-bold text-xs text-text-primary hover:text-primary transition line-clamp-1 group/title"
        >
          <span>{activity.title || activity.communityName || 'Community Item'}</span>
          <ExternalLink className="h-3 w-3 opacity-0 group-hover/title:opacity-100 transition-opacity text-primary shrink-0" />
        </Link>

        {/* Community Name Badge tag if available */}
        {activity.communityName && activity.activityType !== 'COMMUNITY_JOINED' && (
          <div className="mt-1 flex items-center gap-1.5">
            <Link
              to={`/communities/${activity.communityId}`}
              className="inline-flex items-center gap-1 rounded-md bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-muted hover:text-primary transition"
            >
              <Layers className="h-2.5 w-2.5 text-primary" />
              <span>{activity.communityName}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
