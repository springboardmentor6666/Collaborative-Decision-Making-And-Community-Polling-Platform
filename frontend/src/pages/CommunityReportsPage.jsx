import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCommunityByIdApi,
  getCommunityDecisionsApi,
  getCommunityAnalyticsApi,
  getCommunityMembersApi,
} from '../api/axiosClient';
import { exportAnalyticsToPDF, exportAnalyticsToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

export default function CommunityReportsPage() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const [community, setCommunity] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [commData, decData, analData, memData] = await Promise.all([
          getCommunityByIdApi(id, accessToken),
          getCommunityDecisionsApi(id, accessToken).catch(() => []),
          getCommunityAnalyticsApi(id, accessToken).catch(() => null),
          getCommunityMembersApi(id, accessToken).catch(() => []),
        ]);

        setCommunity(commData);
        setDecisions(decData || []);
        setAnalytics(analData);
        setMembersCount(Array.isArray(memData) ? memData.length : (commData?.memberCount || 0));
      } catch (err) {
        setError(err.message || 'Failed to load community report');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, accessToken]);

  const totalVotes =
    analytics?.totalVotes ||
    decisions.reduce((sum, d) => sum + (d.votesCount || 0), 0);

  const activeDecisions = decisions.filter((d) => d.status === 'OPEN').length;
  const closedDecisions = decisions.filter((d) => d.status === 'CLOSED').length;

  const handleExportPDF = () => {
    const reportData = {
      totalDecisions: decisions.length,
      totalReach: decisions.reduce((s, d) => s + (d.reach || d.views * 3 || 0), 0),
      totalViews: decisions.reduce((s, d) => s + (d.views || 0), 0),
      totalVotes,
      activeDecisions,
      closedDecisions,
      conversionRate: decisions.length > 0 ? Math.round((totalVotes / Math.max(decisions.length * 5, 1)) * 100) : 0,
      avgVotesPerPoll: decisions.length > 0 ? (totalVotes / decisions.length).toFixed(1) : '0.0',
      decisions,
    };
    exportAnalyticsToPDF(reportData, user);
  };

  const handleExportCSV = () => {
    const reportData = {
      totalDecisions: decisions.length,
      totalReach: decisions.reduce((s, d) => s + (d.reach || d.views * 3 || 0), 0),
      totalViews: decisions.reduce((s, d) => s + (d.views || 0), 0),
      totalVotes,
      activeDecisions,
      closedDecisions,
      conversionRate: decisions.length > 0 ? Math.round((totalVotes / Math.max(decisions.length * 5, 1)) * 100) : 0,
      avgVotesPerPoll: decisions.length > 0 ? (totalVotes / decisions.length).toFixed(1) : '0.0',
      decisions,
    };
    exportAnalyticsToCSV(reportData);
  };

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />

      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            {/* Navigation back */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/communities/${id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Community
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3.5 py-2 text-xs font-bold text-text-primary transition hover:bg-surface-alt"
                >
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3.5 py-2 text-xs font-bold text-text-primary transition hover:bg-surface-alt"
                >
                  <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV / Excel
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : error || !community ? (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface p-8 text-center">
                <p className="text-secondary">{error || 'Community not found.'}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                          Community Intelligence Report
                        </span>
                        <span className="text-xs text-muted">
                          Category: {community.categoryName || community.category?.name || 'General'}
                        </span>
                      </div>
                      <h1 className="mt-2 text-3xl font-black text-text-primary tracking-tight">
                        {community.name}
                      </h1>
                      <p className="mt-1 text-sm text-secondary line-clamp-2">
                        {community.description || 'No community description provided.'}
                      </p>
                    </div>

                    <Link
                      to={`/communities/${id}`}
                      className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-app hover:bg-primary-hover transition text-center"
                    >
                      Visit Community Space
                    </Link>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Decisions</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">{decisions.length}</p>
                    <p className="mt-1 text-[11px] text-muted">{activeDecisions} active polls</p>
                  </div>

                  <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Votes</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{totalVotes}</p>
                    <p className="mt-1 text-[11px] text-muted">Community votes cast</p>
                  </div>

                  <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Community Members</p>
                    <p className="mt-2 text-3xl font-black text-indigo-600">{membersCount}</p>
                    <p className="mt-1 text-[11px] text-muted">Active contributors</p>
                  </div>

                  <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Avg Votes / Poll</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">
                      {decisions.length > 0 ? (totalVotes / decisions.length).toFixed(1) : '0.0'}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">Engagement density</p>
                  </div>
                </div>

                {/* Decisions Table */}
                <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-primary">
                      Decisions Hosted in this Community ({decisions.length})
                    </h3>
                  </div>

                  {decisions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border-default bg-surface-alt p-8 text-center">
                      <p className="text-sm text-secondary">No decision boards posted in this community yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-border-default">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-alt border-b border-border-default font-bold text-muted">
                          <tr>
                            <th className="p-3.5">Decision Title</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-center">Votes</th>
                            <th className="p-3.5 text-center">Options</th>
                            <th className="p-3.5">Created Date</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default bg-surface">
                          {decisions.map((dec) => (
                            <tr key={dec.id} className="hover:bg-surface-alt/50 transition">
                              <td className="p-3.5 font-bold text-text-primary max-w-xs truncate">
                                {dec.title}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={{
                                    backgroundColor:
                                      dec.status === 'OPEN' ? 'var(--status-open-bg)' : 'var(--status-closed-bg)',
                                    color:
                                      dec.status === 'OPEN' ? 'var(--status-open-text)' : 'var(--status-closed-text)',
                                  }}
                                >
                                  {dec.status || 'OPEN'}
                                </span>
                              </td>
                              <td className="p-3.5 text-center font-black text-emerald-600">
                                {dec.votesCount || 0}
                              </td>
                              <td className="p-3.5 text-center text-muted">
                                {dec.optionsCount || dec.poll?.options?.length || 0}
                              </td>
                              <td className="p-3.5 text-muted">
                                {new Date(dec.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                <Link
                                  to={`/decisions/${dec.id}`}
                                  className="text-primary font-bold hover:underline"
                                >
                                  Details
                                </Link>
                                <Link
                                  to={`/decisions/${dec.id}/report`}
                                  className="text-indigo-600 font-bold hover:underline"
                                >
                                  Report
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
