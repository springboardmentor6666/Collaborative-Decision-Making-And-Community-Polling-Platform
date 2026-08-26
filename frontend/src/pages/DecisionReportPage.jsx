import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDecisionById, getMyVotesAnalysisApi } from '../api/axiosClient';
import { exportDecisionToPDF, exportDecisionToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

export default function DecisionReportPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [decision, setDecision] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [decData, userAnalysis] = await Promise.all([
          fetchDecisionById(id, accessToken),
          getMyVotesAnalysisApi(accessToken).catch(() => []),
        ]);
        setDecision(decData);

        const myVote = (userAnalysis || []).find((v) => String(v.decisionId) === String(id));
        if (myVote) {
          setUserVote({
            optionId: myVote.userChoice?.optionId,
            optionText: myVote.userChoice?.optionText,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load decision report');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, accessToken]);

  const totalVotes =
    decision?.votesCount ||
    decision?.poll?.options?.reduce((sum, o) => sum + (o.voteCount || 0), 0) ||
    0;

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <div className="print:hidden">
        <Navbar />
        <IconSidebar />
      </div>

      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 print:p-0 print:max-w-none">
            {/* Header controls - hidden during printing */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <Link
                to={`/decisions/${id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Decision
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
                <button
                  onClick={() => exportDecisionToPDF(decision, userVote)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-2 text-xs font-bold text-text-primary transition hover:bg-surface-alt"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => exportDecisionToCSV(decision, userVote)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-2 text-xs font-bold text-text-primary transition hover:bg-surface-alt"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : error || !decision ? (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface p-8 text-center">
                <p className="text-secondary">{error || 'Decision not found.'}</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-border-default bg-surface p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
                {/* Report Header */}
                <div className="border-b border-border-default pb-6">
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span className="font-bold uppercase tracking-wider text-primary">DecisionHub Official Report</span>
                    <span>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                    {decision.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className="rounded-full px-2.5 py-0.5 font-bold"
                      style={{
                        backgroundColor: decision.status === 'OPEN' ? 'var(--status-open-bg)' : 'var(--status-closed-bg)',
                        color: decision.status === 'OPEN' ? 'var(--status-open-text)' : 'var(--status-closed-text)',
                      }}
                    >
                      {decision.status || 'OPEN'}
                    </span>
                    {decision.categoryName && (
                      <span className="rounded-full bg-surface-alt px-2.5 py-0.5 font-semibold text-secondary">
                        Category: {decision.categoryName}
                      </span>
                    )}
                    {decision.communityName && (
                      <span className="rounded-full bg-surface-alt px-2.5 py-0.5 font-semibold text-secondary">
                        Community: {decision.communityName}
                      </span>
                    )}
                    <span className="text-muted">
                      Created by {decision.createdBy?.name || decision.createdBy?.email || 'Author'} on{' '}
                      {new Date(decision.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border-default bg-surface-alt p-4 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Audience Views</p>
                    <p className="mt-0.5 text-xl font-black text-indigo-600">{decision.views || 0}</p>
                  </div>
                  <div className="border-x border-border-default">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Votes Cast</p>
                    <p className="mt-0.5 text-xl font-black text-emerald-600">{totalVotes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Conversion Rate</p>
                    <p className="mt-0.5 text-xl font-black text-amber-600">
                      {decision.views > 0 ? Math.round((totalVotes / decision.views) * 100) : 0}%
                    </p>
                  </div>
                </div>

                {/* Overview / Problem Statement */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Overview & Context</h3>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap rounded-2xl border border-border-default bg-surface p-4">
                    {decision.description || 'No background description provided.'}
                  </p>
                </div>

                {/* Attached Poll Breakdown */}
                {decision.poll && decision.poll.options && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                        Voting Results & Breakdown
                      </h3>
                      <span className="text-xs font-semibold text-muted">
                        Poll: "{decision.poll.question || decision.title}"
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border-default">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-alt border-b border-border-default text-muted font-bold">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Option</th>
                            <th className="p-3 text-right">Votes</th>
                            <th className="p-3 text-right">Share (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default bg-surface">
                          {decision.poll.options.map((opt, idx) => {
                            const vCount = opt.voteCount || 0;
                            const pct = totalVotes > 0 ? Math.round((vCount / totalVotes) * 100) : 0;
                            const isUserChoice =
                              userVote &&
                              (Number(userVote.optionId) === Number(opt.id) ||
                                userVote.optionText === opt.optionText);

                            return (
                              <tr key={opt.id || idx} className={isUserChoice ? 'bg-primary-soft/20' : ''}>
                                <td className="p-3 font-bold text-muted">{idx + 1}</td>
                                <td className="p-3 font-semibold text-text-primary">
                                  {opt.optionText}
                                  {isUserChoice && (
                                    <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                                      Your Vote ✓
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right font-black text-text-primary">{vCount}</td>
                                <td className="p-3 text-right font-bold text-primary">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Multi-Criteria Comparison Matrix if present */}
                {decision.comparisonFactors && decision.comparisonFactors.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                      Multi-Criteria Comparison Matrix
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-border-default">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-alt border-b border-border-default font-bold text-muted">
                          <tr>
                            <th className="p-3">Option</th>
                            {decision.comparisonFactors.map((factor) => (
                              <th key={factor.id || factor.name} className="p-3 text-center">
                                {factor.name || factor}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default bg-surface">
                          {(decision.options || decision.poll?.options || []).map((opt) => (
                            <tr key={opt.id}>
                              <td className="p-3 font-bold text-text-primary">{opt.optionText || opt.name || opt.label}</td>
                              {decision.comparisonFactors.map((factor) => {
                                const scoreObj = (decision.optionScores || []).find(
                                  (s) => s.optionId === opt.id && s.factorId === (factor.id || factor)
                                );
                                return (
                                  <td key={factor.id || factor.name} className="p-3 text-center font-semibold text-secondary">
                                    {scoreObj ? scoreObj.score : '—'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Report Signoff Footer */}
                <div className="border-t border-border-default pt-4 text-center text-xs text-muted">
                  <p>DecisionHub Platform • Collaborative Decision-Making & Community Polling</p>
                  <p className="mt-0.5 text-[10px]">Document generated from verified live database telemetry.</p>
                </div>
              </div>
            )}
          </div>
          <div className="print:hidden">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
