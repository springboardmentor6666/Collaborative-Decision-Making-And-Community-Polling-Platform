import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStatsOverviewApi, getAdminStatsTimeSeriesApi } from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import Loader from '../components/Loader';

export default function AdminStatisticsPage() {
  const { accessToken } = useAuth();
  const [overview, setOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tsLoading, setTsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7D');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeMetric, setActiveMetric] = useState('all'); // all | decisions | users | comments | reports
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    loadOverview();
  }, [accessToken]);

  useEffect(() => {
    loadTimeSeries();
  }, [timeRange, accessToken]);

  const loadOverview = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await getAdminStatsOverviewApi(accessToken);
      setOverview(data);
    } catch (err) {
      console.error('Failed to load stats overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSeries = async () => {
    if (!accessToken) return;
    try {
      setTsLoading(true);
      const data = await getAdminStatsTimeSeriesApi(
        {
          range: timeRange,
          startDate: timeRange === 'CUSTOM' ? customStart : undefined,
          endDate: timeRange === 'CUSTOM' ? customEnd : undefined,
        },
        accessToken
      );
      setTimeSeries(data);
    } catch (err) {
      console.error('Failed to load time series stats:', err);
    } finally {
      setTsLoading(false);
    }
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setTimeRange('CUSTOM');
      loadTimeSeries();
    }
  };

  // Chart Rendering Helpers
  const dailyData = timeSeries?.dailyData || [];
  const maxVal = Math.max(
    1,
    ...dailyData.map((d) =>
      Math.max(
        d.decisionsCount || 0,
        d.usersCount || 0,
        d.commentsCount || 0,
        d.discussionsCount || 0,
        d.reportsCount || 0
      )
    )
  );

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">

            {/* Header with Navigation Breadcrumb & Admin Tabs */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold text-sm">
                    📊
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Platform Analytics</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-text-primary">Application Statistics</h1>
                <p className="mt-1 text-sm text-secondary">
                  Real-time database metrics, daily growth trends, engagement telemetry, and content moderation analytics.
                </p>
              </div>

              {/* Admin Navigation Pills */}
              <div className="flex items-center gap-1.5 rounded-2xl bg-surface p-1.5 border border-border-default shadow-xs">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-alt transition"
                >
                  <span>👥</span>
                  <span>User Control</span>
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-alt transition"
                >
                  <span>🛡️</span>
                  <span>Report Moderation</span>
                </Link>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs"
                >
                  <span>📊</span>
                  <span>Statistics</span>
                </button>
                <button
                  onClick={() => {
                    loadOverview();
                    loadTimeSeries();
                  }}
                  className="p-2 text-muted hover:text-text-primary hover:bg-surface-alt rounded-xl transition"
                  title="Refresh metrics"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {loading && !overview ? (
              <Loader message="Calculating application statistics..." />
            ) : (
              <div className="space-y-8">

                {/* 1. Core Summary Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Users Metric */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-3xl border border-border-default bg-surface p-5 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Users</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 text-sm">
                        👥
                      </span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">
                      {overview?.totalUsers?.toLocaleString() || 0}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border-default">
                      <span className="text-emerald-600 font-semibold">+{overview?.newUsersToday || 0} today</span>
                      <span>{overview?.activeUsers || 0} active</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                      <span>+{overview?.newUsersThisWeek || 0} this week</span>
                      <span>+{overview?.newUsersThisMonth || 0} this month</span>
                    </div>
                  </motion.div>

                  {/* Decisions Metric */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-border-default bg-surface p-5 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Decisions</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 text-sm">
                        ⚖️
                      </span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">
                      {overview?.totalDecisions?.toLocaleString() || 0}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border-default">
                      <span className="text-emerald-600 font-semibold">+{overview?.decisionsCreatedToday || 0} today</span>
                      <span>{overview?.openDecisions || 0} open</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                      <span>+{overview?.decisionsCreatedThisWeek || 0} this week</span>
                      <span>+{overview?.decisionsCreatedThisMonth || 0} this month</span>
                    </div>
                  </motion.div>

                  {/* Communities Metric */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-3xl border border-border-default bg-surface p-5 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Communities</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 text-sm">
                        🌐
                      </span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">
                      {overview?.totalCommunities?.toLocaleString() || 0}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border-default">
                      <span className="text-emerald-600 font-semibold">+{overview?.communitiesCreatedToday || 0} today</span>
                      <span>{overview?.publicCommunities || 0} public</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                      <span>+{overview?.communitiesCreatedThisWeek || 0} this week</span>
                      <span>+{overview?.communitiesCreatedThisMonth || 0} this month</span>
                    </div>
                  </motion.div>

                  {/* Moderation & Reports Metric */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-border-default bg-surface p-5 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Reports & Flags</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 text-sm">
                        🚩
                      </span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">
                      {overview?.totalReports?.toLocaleString() || 0}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border-default">
                      <span className="text-amber-600 font-bold">{overview?.pendingReports || 0} pending</span>
                      <span className="text-emerald-600 font-semibold">{overview?.resolvedReports || 0} resolved</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                      <span>{overview?.temporarilyRemovedContent || 0} hidden</span>
                      <span>{overview?.permanentlyRemovedContent || 0} removed</span>
                    </div>
                  </motion.div>
                </div>

                {/* 2. Secondary Telemetry Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl border border-border-default bg-surface-alt">
                  <div className="p-3 text-center sm:text-left">
                    <span className="text-[11px] font-bold text-muted uppercase">Total Comments</span>
                    <p className="text-xl font-black text-text-primary mt-0.5">{overview?.totalComments?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">+{overview?.commentsCreatedToday || 0} today</p>
                  </div>
                  <div className="p-3 text-center sm:text-left border-l border-border-default">
                    <span className="text-[11px] font-bold text-muted uppercase">Discussions & Chat</span>
                    <p className="text-xl font-black text-text-primary mt-0.5">{overview?.totalDiscussions?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">+{overview?.discussionsCreatedToday || 0} today</p>
                  </div>
                  <div className="p-3 text-center sm:text-left border-l border-border-default">
                    <span className="text-[11px] font-bold text-muted uppercase">Total Votes Cast</span>
                    <p className="text-xl font-black text-text-primary mt-0.5">{overview?.totalVotes?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-muted">Across all decisions</p>
                  </div>
                  <div className="p-3 text-center sm:text-left border-l border-border-default">
                    <span className="text-[11px] font-bold text-muted uppercase">Interactive Polls</span>
                    <p className="text-xl font-black text-text-primary mt-0.5">{overview?.totalPolls?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-muted">MCDA & single/multi</p>
                  </div>
                </div>

                {/* 3. Time-Based Usage Telemetry Chart & Filters */}
                <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
                    <div>
                      <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                        <span>Daily Usage & Activity Trends</span>
                        {tsLoading && <span className="text-xs font-normal text-muted animate-pulse">(Updating...)</span>}
                      </h2>
                      <p className="text-xs text-muted mt-0.5">
                        {timeSeries ? `Timeline: ${timeSeries.startDate} to ${timeSeries.endDate}` : 'Daily breakdown of actions across the platform'}
                      </p>
                    </div>

                    {/* Time Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'TODAY', label: 'Today' },
                        { id: '7D', label: 'Last 7 Days' },
                        { id: '30D', label: 'Last 30 Days' },
                        { id: '90D', label: 'Last 90 Days' },
                      ].map((tf) => (
                        <button
                          key={tf.id}
                          onClick={() => setTimeRange(tf.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            timeRange === tf.id
                              ? 'bg-primary text-white shadow-xs'
                              : 'border border-border-default bg-surface text-text-secondary hover:bg-surface-alt'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Range Picker */}
                  <form onSubmit={handleApplyCustomDate} className="flex flex-wrap items-center gap-2 bg-surface-alt p-3 rounded-2xl border border-border-default text-xs">
                    <span className="font-semibold text-muted">Custom Range:</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="app-input px-2.5 py-1 text-xs"
                      required
                    />
                    <span className="text-muted">to</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="app-input px-2.5 py-1 text-xs"
                      required
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-hover shadow-xs"
                    >
                      Filter
                    </button>
                  </form>

                  {/* Metric Legend Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      { id: 'all', label: 'All Activities', color: 'bg-primary' },
                      { id: 'decisions', label: 'Decisions', color: 'bg-purple-500' },
                      { id: 'users', label: 'New Users', color: 'bg-blue-500' },
                      { id: 'comments', label: 'Comments', color: 'bg-emerald-500' },
                      { id: 'discussions', label: 'Discussions', color: 'bg-amber-500' },
                      { id: 'reports', label: 'Reports', color: 'bg-rose-500' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveMetric(m.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition ${
                          activeMetric === m.id
                            ? 'border-primary bg-primary-soft text-primary font-bold shadow-xs'
                            : 'border-border-default bg-surface text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${m.color}`} />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* SVG / Bar Chart Representation */}
                  <div className="pt-4">
                    {dailyData.length === 0 ? (
                      <div className="p-12 text-center text-muted">No activity records found for this timeframe.</div>
                    ) : (
                      <div className="space-y-4">
                        {/* Interactive Bar Matrix */}
                        <div className="relative h-64 w-full flex items-end gap-1 sm:gap-2 pt-6 border-b border-border-default">
                          {dailyData.map((d, idx) => {
                            const decH = (d.decisionsCount / maxVal) * 100;
                            const usrH = (d.usersCount / maxVal) * 100;
                            const comH = (d.commentsCount / maxVal) * 100;
                            const disH = (d.discussionsCount / maxVal) * 100;
                            const repH = (d.reportsCount / maxVal) * 100;

                            const isHovered = hoveredPoint === idx;

                            return (
                              <div
                                key={d.date}
                                className="flex-1 flex flex-col justify-end items-center h-full group relative cursor-pointer"
                                onMouseEnter={() => setHoveredPoint(idx)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              >
                                {/* Tooltip on Hover */}
                                {isHovered && (
                                  <div className="absolute bottom-full mb-2 z-30 min-w-[150px] p-2.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl pointer-events-none">
                                    <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-300">{d.date}</p>
                                    <p className="flex justify-between text-purple-400"><span>Decisions:</span> <b>{d.decisionsCount}</b></p>
                                    <p className="flex justify-between text-blue-400"><span>Users:</span> <b>{d.usersCount}</b></p>
                                    <p className="flex justify-between text-emerald-400"><span>Comments:</span> <b>{d.commentsCount}</b></p>
                                    <p className="flex justify-between text-amber-400"><span>Discussions:</span> <b>{d.discussionsCount}</b></p>
                                    <p className="flex justify-between text-rose-400"><span>Reports:</span> <b>{d.reportsCount}</b></p>
                                  </div>
                                )}

                                {/* Bar Segments */}
                                <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                                  {(activeMetric === 'all' || activeMetric === 'decisions') && (
                                    <div
                                      style={{ height: `${Math.max(4, decH)}%` }}
                                      className="flex-1 rounded-t-sm bg-purple-500/80 group-hover:bg-purple-500 transition-all"
                                      title={`Decisions: ${d.decisionsCount}`}
                                    />
                                  )}
                                  {(activeMetric === 'all' || activeMetric === 'users') && (
                                    <div
                                      style={{ height: `${Math.max(4, usrH)}%` }}
                                      className="flex-1 rounded-t-sm bg-blue-500/80 group-hover:bg-blue-500 transition-all"
                                      title={`Users: ${d.usersCount}`}
                                    />
                                  )}
                                  {(activeMetric === 'all' || activeMetric === 'comments') && (
                                    <div
                                      style={{ height: `${Math.max(4, comH)}%` }}
                                      className="flex-1 rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-500 transition-all"
                                      title={`Comments: ${d.commentsCount}`}
                                    />
                                  )}
                                  {(activeMetric === 'all' || activeMetric === 'reports') && d.reportsCount > 0 && (
                                    <div
                                      style={{ height: `${Math.max(4, repH)}%` }}
                                      className="flex-1 rounded-t-sm bg-rose-500/80 group-hover:bg-rose-500 transition-all"
                                      title={`Reports: ${d.reportsCount}`}
                                    />
                                  )}
                                </div>

                                <span className="text-[9px] text-muted mt-1 truncate max-w-[40px]">
                                  {d.date.slice(5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Moderation & Categorical Breakdown Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reports Breakdown by Content Type */}
                  <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                      Reports by Content Type
                    </h3>
                    <div className="space-y-3">
                      {['DECISION', 'COMMENT', 'DISCUSSION', 'USER'].map((t) => {
                        const count = overview?.reportsByContentType?.[t] || 0;
                        const total = overview?.totalReports || 1;
                        const pct = Math.round((count / (total === 0 ? 1 : total)) * 100);

                        return (
                          <div key={t} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-text-primary">{t}</span>
                              <span className="text-muted">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  t === 'DECISION'
                                    ? 'bg-purple-500'
                                    : t === 'COMMENT'
                                    ? 'bg-emerald-500'
                                    : t === 'DISCUSSION'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reports Breakdown by Status */}
                  <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                      Moderation Resolution Status
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'PENDING', label: 'Pending Review', color: 'bg-amber-500' },
                        { key: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-500' },
                        { key: 'NO_ACTION', label: 'No Action Taken', color: 'bg-blue-500' },
                        { key: 'TEMPORARILY_REMOVED', label: 'Temporarily Hidden', color: 'bg-orange-500' },
                        { key: 'CONTENT_REMOVED', label: 'Permanently Removed', color: 'bg-rose-500' },
                      ].map((s) => {
                        const count = overview?.reportsByStatus?.[s.key] || 0;
                        const total = overview?.totalReports || 1;
                        const pct = Math.round((count / (total === 0 ? 1 : total)) * 100);

                        return (
                          <div key={s.key} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-text-primary">{s.label}</span>
                              <span className="text-muted">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                              <div
                                className={`h-full rounded-full ${s.color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
