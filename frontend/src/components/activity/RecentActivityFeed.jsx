/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: RecentActivityFeed.jsx
 * Architecture Tier: Activity Stream Component (UI Layer)
 * Path: frontend/src/components/activity/RecentActivityFeed.jsx
 *
 * Purpose:
 *   Live activity feed panel displaying real-time platform and community events with filtering and smooth list animations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Filter,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  Vote,
  MessageSquare,
  Users,
  Layers,
} from 'lucide-react';
import {
  getRecentActivitiesApi,
  getCommunityActivitiesApi,
  getUserActivitiesApi,
} from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import ActivityItemCard from './ActivityItemCard';

const FILTER_TABS = [
  { id: 'ALL', label: 'All', types: null },
  { id: 'DECISIONS', label: 'Decisions', types: 'DECISION_CREATED,DECISION_CLOSED' },
  { id: 'VOTES', label: 'Votes', types: 'VOTE_CAST' },
  { id: 'COMMENTS', label: 'Comments', types: 'COMMENT_ADDED' },
  { id: 'COMMUNITY', label: 'Community', types: 'COMMUNITY_JOINED' },
];

export default function RecentActivityFeed({
  feedType = 'GLOBAL', // 'GLOBAL' | 'COMMUNITY' | 'USER'
  targetId = null,
  limit = 15,
  showHeader = true,
  compact = false,
}) {
  const { accessToken } = useAuth();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());



  const fetchActivities = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);

      const currentTab = FILTER_TABS.find((t) => t.id === activeFilter);
      const params = {
        type: currentTab?.types || undefined,
        limit,
        page: 0,
      };

      try {
        let data = [];
        if (feedType === 'COMMUNITY' && targetId) {
          data = await getCommunityActivitiesApi(targetId, params, accessToken);
        } else if (feedType === 'USER' && targetId) {
          data = await getUserActivitiesApi(targetId, params, accessToken);
        } else {
          data = await getRecentActivitiesApi(params, accessToken);
        }

        setActivities(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      } catch (err) {
        // Silently preserve previous list on temporary network fluctuation
      } finally {
        setLoading(false);
        if (isManualRefresh) setRefreshing(false);
      }
    },
    [feedType, targetId, activeFilter, limit, accessToken]
  );

  // Initial load and filter change
  useEffect(() => {
    setLoading(true);
    fetchActivities();
  }, [fetchActivities]);



  return (
    <div className="flex flex-col h-full rounded-3xl border border-border-default bg-surface p-5 shadow-sm">
      {/* Header with Live Ticker Badge & Refresh Button */}
      {showHeader && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary leading-tight">
                {feedType === 'GLOBAL'
                  ? '⚡ Live Platform Activity'
                  : feedType === 'COMMUNITY'
                  ? 'Community Activity'
                  : 'Personal Activity'}
              </h3>
              <p className="text-[10px] text-muted">Real-time participation stream</p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => fetchActivities(true)}
              disabled={refreshing}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-muted hover:bg-surface-alt hover:text-text-primary transition disabled:opacity-50"
              title="Refresh Activity"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-app'
                  : 'border border-border-default bg-surface-alt/50 text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Activity Feed Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {loading ? (
          /* Skeleton Loader */
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-border-default bg-surface-alt/30 p-3.5 animate-pulse"
              >
                <div className="h-9 w-9 rounded-2xl bg-surface-alt" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-surface-alt" />
                  <div className="h-3 w-3/4 rounded bg-surface-alt" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {activities.map((act, idx) => (
              <motion.div
                key={act.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <ActivityItemCard activity={act} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 rounded-2xl border border-dashed border-border-default bg-surface-alt/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt text-muted text-xl">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">No recent activity yet</p>
              <p className="mt-0.5 text-[11px] text-muted max-w-xs mx-auto">
                Actions such as voting, poll creation, and community discussions will show up here automatically in real time.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer ticker info */}
      <div className="mt-3 flex items-center justify-between border-t border-border-default pt-2 text-[10px] text-muted">
        <span>Showing latest {activities.length} updates</span>
        <span>Auto-sync active</span>
      </div>
    </div>
  );
}
