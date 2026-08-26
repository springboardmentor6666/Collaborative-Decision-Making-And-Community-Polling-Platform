import { useEffect, useState, useMemo } from 'react';
import {
  fetchDecisions,
  getCategoriesApi,
  getPopularCategoriesApi,
  getDecisionTrendsApi,
} from '../api/axiosClient';
import DecisionCard from '../components/DecisionCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

const MEDALS = ['🥇', '🥈', '🥉'];
const BAR_ACCENTS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
];

export default function DashboardPage() {
  const { user, accessToken } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [decisionTrends, setDecisionTrends] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDecisions, setLoadingDecisions] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDecisions(accessToken).catch(() => []),
      getCategoriesApi(accessToken).catch(() => []),
      getPopularCategoriesApi(accessToken).catch(() => []),
      getDecisionTrendsApi(accessToken).catch(() => []),
    ]).then(([decData, catData, popCatData, trendsData]) => {
      setDecisions(decData || []);
      setCategories(catData || []);
      setPopularCategories(popCatData || []);
      setDecisionTrends(trendsData || []);
      setLoadingDecisions(false);
    });
  }, [accessToken]);

  // Derived popular categories if backend endpoint returns empty
  const rankedCategories = useMemo(() => {
    if (popularCategories && popularCategories.length > 0) {
      const maxCount = Math.max(...popularCategories.map((c) => Number(c.decisionCount) || 0), 1);
      return popularCategories.map((c) => ({
        id: c.id,
        name: c.name || c.categoryName || 'General',
        count: Number(c.decisionCount) || 0,
        pct: Math.round(((Number(c.decisionCount) || 0) / maxCount) * 100),
      }));
    }

    // Client fallback computed from decisions & categories
    const counts = {};
    decisions.forEach((d) => {
      const name = d.categoryName || 'General';
      counts[name] = (counts[name] || 0) + 1;
    });

    const list = Object.keys(counts).map((name, idx) => ({
      id: idx + 1,
      name,
      count: counts[name],
    }));
    list.sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...list.map((c) => c.count), 1);
    return list.map((c) => ({
      ...c,
      pct: Math.round((c.count / maxCount) * 100),
    }));
  }, [popularCategories, decisions]);

  // Derived filtered decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      const matchesSearch =
        !searchQuery.trim() ||
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' ||
        (d.categoryName && d.categoryName.toLowerCase() === selectedCategory.toLowerCase()) ||
        (d.categoryId && String(d.categoryId) === String(selectedCategory));

      return matchesSearch && matchesCat;
    });
  }, [decisions, searchQuery, selectedCategory]);

  // Max trends for SVG scaling
  const maxTrendDecisions = Math.max(...decisionTrends.map((t) => Number(t.decisionsCreated) || 0), 1);
  const maxTrendVotes = Math.max(...decisionTrends.map((t) => Number(t.votesCast) || 0), 1);
  const maxTrendVal = Math.max(maxTrendDecisions, maxTrendVotes, 5);

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-primary">Decision Dashboard</h1>
                <p className="mt-1 text-secondary">
                  Welcome back, {user?.name || user?.email}! Collective intelligence & polling insights.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/decisions/create"
                  className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Decision
                </Link>
              </div>
            </div>

            {/* Quick Feature Cards for Analysis & Analytics */}
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <Link
                to="/analysis"
                className="group relative flex items-start gap-4 rounded-3xl border border-border-default bg-surface p-5 shadow-sm transition-all duration-200 hover:border-primary-soft hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary transition group-hover:scale-105">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-text-primary group-hover:text-primary">Decision Analysis</h2>
                    <span className="text-xs font-semibold text-primary">View →</span>
                  </div>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">
                    Review all polls you voted on, see whether your choice won or lost with color badges, and inspect vote distribution.
                  </p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="group relative flex items-start gap-4 rounded-3xl border border-border-default bg-surface p-5 shadow-sm transition-all duration-200 hover:border-primary-soft hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 transition group-hover:scale-105">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-text-primary group-hover:text-indigo-600">Creator Analytics</h2>
                    <span className="text-xs font-semibold text-indigo-600">View →</span>
                  </div>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">
                    Track audience reach, view impressions, participation conversion, and vote counts for all decisions you created.
                  </p>
                </div>
              </Link>
            </div>

            {/* Analytics Widgets Section: Popular Categories & Decision Trends & Activity Timeline */}
            <div className="mb-8 grid gap-4 lg:grid-cols-3">
              {/* Widget 1: Popular Categories Ranking */}
              <div className="rounded-3xl border border-border-default bg-surface p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border-default">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-sm text-text-primary">Popular Categories</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-muted">Ranked by volume</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {rankedCategories.slice(0, 5).map((cat, idx) => (
                      <div
                        key={cat.id || idx}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`group cursor-pointer rounded-2xl p-2.5 transition-all border ${
                          selectedCategory === cat.name
                            ? 'border-primary bg-primary-soft/40'
                            : 'border-transparent hover:border-border-default hover:bg-surface-alt'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2 font-bold text-text-primary">
                            <span className="text-sm">{MEDALS[idx] || `#${idx + 1}`}</span>
                            <span className="group-hover:text-primary transition">{cat.name}</span>
                          </div>
                          <span className="font-extrabold text-muted">
                            {cat.count} <span className="font-normal text-[10px]">polls</span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${BAR_ACCENTS[idx % BAR_ACCENTS.length]}`}
                            style={{ width: `${Math.max(cat.pct, 8)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {rankedCategories.length === 0 && (
                      <p className="text-xs text-muted text-center py-6">No category ranking data available.</p>
                    )}
                  </div>
                </div>

                {selectedCategory !== 'ALL' && (
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className="mt-3 w-full rounded-xl border border-border-default py-1.5 text-xs font-bold text-primary hover:bg-surface-alt transition"
                  >
                    Reset Filter (Show All)
                  </button>
                )}
              </div>

              {/* Widget 2: Decision Trends Line Chart */}
              <div className="rounded-3xl border border-border-default bg-surface p-5 shadow-sm flex flex-col justify-between lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border-default">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-sm text-text-primary">Platform Decision & Voting Trends</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" /> Decisions
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Votes
                      </span>
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="mt-4">
                    {decisionTrends.length > 0 ? (
                      <div className="h-44 w-full">
                        <svg viewBox="0 0 500 150" className="h-full w-full overflow-visible">
                          {/* Horizontal Grid lines */}
                          {[0, 37.5, 75, 112.5, 150].map((y, i) => (
                            <line
                              key={i}
                              x1="0"
                              y1={y}
                              x2="500"
                              y2={y}
                              stroke="var(--border)"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                              opacity="0.5"
                            />
                          ))}

                          {/* Points calculations */}
                          {(() => {
                            const step = decisionTrends.length > 1 ? 500 / (decisionTrends.length - 1) : 250;
                            const decisionPoints = decisionTrends.map((t, idx) => {
                              const x = idx * step;
                              const y = 140 - ((Number(t.decisionsCreated) || 0) / maxTrendVal) * 120;
                              return `${x},${y}`;
                            });
                            const votePoints = decisionTrends.map((t, idx) => {
                              const x = idx * step;
                              const y = 140 - ((Number(t.votesCast) || 0) / maxTrendVal) * 120;
                              return `${x},${y}`;
                            });

                            return (
                              <>
                                {/* Decisions Line */}
                                <polyline
                                  fill="none"
                                  stroke="#2563eb"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={decisionPoints.join(' ')}
                                />
                                {/* Votes Line */}
                                <polyline
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={votePoints.join(' ')}
                                />

                                {/* Dots */}
                                {decisionTrends.map((t, idx) => {
                                  const x = idx * step;
                                  const dy = 140 - ((Number(t.decisionsCreated) || 0) / maxTrendVal) * 120;
                                  const vy = 140 - ((Number(t.votesCast) || 0) / maxTrendVal) * 120;
                                  return (
                                    <g key={idx}>
                                      <circle cx={x} cy={dy} r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                                      <circle cx={x} cy={vy} r="3.5" fill="#10b981" className="stroke-white stroke-2" />
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-[10px] text-muted font-semibold mt-2">
                          {decisionTrends.map((t, idx) => (
                            <span key={idx}>{t.date?.slice(5) || `Day ${idx + 1}`}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Minimal fallback visual when backend trends array is empty */
                      <div className="py-8 text-center rounded-2xl border border-dashed border-border-default bg-surface-alt/30">
                        <p className="text-xs font-bold text-text-primary">Historical trends will populate as decisions are published.</p>
                        <p className="text-[11px] text-muted mt-0.5">Real-time telemetry records new decisions & cast votes daily.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Strip */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted border-t border-border-default pt-2.5">
                  <span>📊 Total Platform Decisions: <strong className="text-text-primary">{decisions.length}</strong></span>
                  <span>🗳️ Cumulative Votes: <strong className="text-text-primary">{decisions.reduce((sum, d) => sum + (d.votesCount || 0), 0)}</strong></span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar Side-by-Side */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">
                  {selectedCategory === 'ALL' ? 'All Community Decisions' : `${selectedCategory} Decisions`}
                </h2>
                <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-bold text-muted">
                  {filteredDecisions.length}
                </span>
              </div>

              {/* Side-by-side Filter & Search */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Category Filter Dropdown */}
                <div className="relative min-w-[160px] sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="app-input w-full px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="ALL">✨ All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search decisions..."
                    className="app-input w-full pl-9 pr-4 py-2 text-xs sm:text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-4 w-4 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decisions grid */}
            {loadingDecisions ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredDecisions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center">
                <p className="mb-4 text-secondary">
                  {searchQuery || selectedCategory !== 'ALL'
                    ? 'No decisions match the selected category or search criteria.'
                    : 'No decisions yet. Create your first poll!'}
                </p>
                <Link
                  to="/decisions/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  Create Decision
                </Link>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

