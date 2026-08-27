import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchDecisionById,
  deleteDecisionApi,
  addDecisionOptionApi,
  closeDecisionApi,
  getMyVotesAnalysisApi,
  recordImpressionApi,
  getDecisionFilesApi,
  uploadDecisionFileApi,
  deleteAttachmentFileApi,
} from '../api/axiosClient';
import { exportDecisionToPDF, exportDecisionToCSV } from '../utils/exportUtils';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import Loader from '../components/Loader';
import CategoryBadge from '../components/CategoryBadge';
import ComparisonMatrix from '../components/ComparisonMatrix';
import CommentSection from '../components/CommentSection';
import ReportModal from '../components/ReportModal';

export default function DecisionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [decision, setDecision] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Post-creation option addition & decision close states
  const [showAddOptionInput, setShowAddOptionInput] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const [addingOption, setAddingOption] = useState(false);
  const [closingDecision, setClosingDecision] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, accessToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dec, files] = await Promise.all([
        fetchDecisionById(id, accessToken),
        getDecisionFilesApi(id, accessToken).catch(() => []),
      ]);
      setDecision(dec);
      setAttachments(files || []);

      // Record a view impression
      await recordImpressionApi(id, 'VIEW', accessToken);

      // Check if current user has already voted
      if (accessToken) {
        try {
          const votesAnalysis = await getMyVotesAnalysisApi(accessToken);
          const vote = votesAnalysis.find(v => String(v.decisionId) === String(id));
          if (vote) {
            setUserVote({ optionId: vote.userChoice?.optionId, optionText: vote.userChoice?.optionText });
          }
        } catch (e) {
          // ignore error fetching votes
        }
      }
    } catch {
      setError('Decision not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      await uploadDecisionFileApi(id, file, accessToken);
      const files = await getDecisionFilesApi(id, accessToken);
      setAttachments(files);
    } catch (err) {
      alert(err.message || 'Failed to upload attachment.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await deleteAttachmentFileApi(fileId, accessToken);
      setAttachments(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      alert('Failed to delete attachment.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this decision?')) return;
    try {
      setDeleting(true);
      await deleteDecisionApi(id, accessToken);
      navigate('/dashboard');
    } catch {
      alert('Failed to delete decision.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddOption = async (e) => {
    if (e) e.preventDefault();
    const text = newOptionText.trim();
    if (!text) return;
    try {
      setAddingOption(true);
      const result = await addDecisionOptionApi(id, text, accessToken);
      const createdOption = {
        id: result?.id || Date.now(),
        optionText: result?.optionText || result?.label || text,
        voteCount: result?.voteCount || 0,
      };

      setDecision(prev => {
        if (!prev) return prev;
        const currentPoll = prev.poll || { question: prev.title, options: [] };
        const updatedPollOptions = [...(currentPoll.options || []), createdOption];
        return {
          ...prev,
          poll: {
            ...currentPoll,
            options: updatedPollOptions,
          },
          options: [...(prev.options || []), createdOption],
          optionsCount: (prev.optionsCount || 0) + 1,
        };
      });

      setNewOptionText('');
      setShowAddOptionInput(false);
    } catch (err) {
      alert(err.message || 'Failed to add option.');
    } finally {
      setAddingOption(false);
    }
  };

  const handleCloseDecision = async () => {
    if (!window.confirm('Are you sure you want to close this poll and finalize the decision? No further votes will be accepted.')) {
      return;
    }
    try {
      setClosingDecision(true);
      const updated = await closeDecisionApi(id, accessToken);
      setDecision(prev => ({
        ...prev,
        status: updated?.status || 'CLOSED',
      }));
    } catch (err) {
      alert(err.message || 'Failed to close decision.');
    } finally {
      setClosingDecision(false);
    }
  };

  const isCreator = user && decision?.createdBy && (user.id === decision.createdBy.id || user.email === decision.createdBy.email || user.role === 'ADMIN');
  const isOpen = decision?.status === 'OPEN' || decision?.status === 'OPEN_TO_VOTE' || decision?.status === 'Active';

  const getStatusStyle = (status) => {
    if (status === 'OPEN' || status === 'OPEN_TO_VOTE' || status === 'Active') {
      return { backgroundColor: 'var(--status-open-bg)', color: 'var(--status-open-text)' };
    }
    if (status === 'CLOSED' || status === 'Completed') {
      return { backgroundColor: 'var(--status-closed-bg)', color: 'var(--status-closed-text)' };
    }
    return { backgroundColor: 'var(--surface-alt)', color: 'var(--text-secondary)' };
  };

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
            {loading ? (
              <Loader message="Loading decision details..." />
            ) : error || !decision ? (
              <div className="rounded-2xl border border-dashed border-default p-12 text-center">
                <p className="mb-4 text-secondary">{error || 'Decision not found.'}</p>
                <Link to="/dashboard" className="text-sm font-bold text-primary hover:underline">
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Export & Printable Report Buttons */}
                    <Link
                      to={`/decisions/${id}/report`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-alt hover:border-primary/40 shadow-sm"
                      title="View printable decision report summary"
                    >
                      <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Printable View
                    </Link>
                    <button
                      onClick={() => exportDecisionToPDF(decision, userVote)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-alt hover:border-primary/40 shadow-sm"
                      title="Export decision report as PDF"
                    >
                      <svg className="h-3.5 w-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Export PDF
                    </button>
                    <button
                      onClick={() => exportDecisionToCSV(decision, userVote)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-alt hover:border-emerald-500/40 shadow-sm"
                      title="Export decision data as Excel / CSV"
                    >
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Excel
                    </button>

                    {/* Report Content Flag */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300 shadow-sm"
                      title="Flag or report this decision"
                    >
                      <span className="text-xs">🚩</span>
                      Report
                    </button>

                    {isCreator && (
                      <div className="flex items-center gap-2">
                        {isOpen && (
                          <button
                            onClick={handleCloseDecision}
                            disabled={closingDecision}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/20 shadow-sm"
                            title="Close voting and mark decision as finalized"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {closingDecision ? 'Closing...' : 'Close Poll / Finalize'}
                          </button>
                        )}
                        <Link
                          to={`/decisions/${id}/edit`}
                          className="rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-alt"
                        >
                          Edit Decision
                        </Link>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decision Main Card */}
                <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-5 min-w-0">
                  {/* Status + Category + Title */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-default pb-5 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={getStatusStyle(decision.status)}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: !isOpen ? 'var(--status-closed-text)' : 'var(--status-open-text)' }} />
                          {decision.status}
                        </span>
                        {decision.categoryName && (
                          <CategoryBadge name={decision.categoryName} size="sm" />
                        )}
                        {decision.communityName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                            👥 {decision.communityName}
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl font-black tracking-tight text-text-primary break-words [overflow-wrap:anywhere]">{decision.title}</h1>
                    </div>

                    {isOpen && decision.poll && (
                      <Link
                        to={`/decisions/${id}/vote`}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover shrink-0"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {userVote ? 'View / Change Vote' : 'Cast Vote Now'}
                      </Link>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-secondary">
                    {decision.createdBy?.name && (
                      <span>
                        Created by{' '}
                        <strong className="font-semibold text-text-primary">{decision.createdBy.name}</strong>
                      </span>
                    )}
                    {decision.createdAt && (
                      <span>{new Date(decision.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                    {decision.views !== undefined && (
                      <span>👁️ {decision.views} views</span>
                    )}
                    {decision.votesCount !== undefined && (
                      <span>🗳️ {decision.votesCount} total votes</span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-muted">Description</p>
                    <p className="text-sm leading-relaxed text-secondary whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {decision.description || 'No detailed background provided.'}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  <div className="border-t border-border-default pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                        Attachments & Documents ({attachments.length})
                      </p>
                      {isCreator && (
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1 text-xs font-semibold text-primary transition hover:bg-surface-alt shadow-sm">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span>{uploadingAttachment ? 'Uploading...' : 'Attach File'}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleUploadAttachment}
                            disabled={uploadingAttachment}
                          />
                        </label>
                      )}
                    </div>

                    {attachments.length === 0 ? (
                      <p className="text-xs text-muted">No files or documents attached.</p>
                    ) : (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {attachments.map((att) => {
                          const isImg = att.fileType?.startsWith('image/') || att.filename?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                          return (
                            <div
                              key={att.id}
                              className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-2.5 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-bold text-primary shadow-xs">
                                  {isImg ? '🖼️' : '📄'}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <a
                                    href={att.fileUrl || `/api/files/download/${att.filename}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-text-primary hover:underline truncate block"
                                    title={att.filename}
                                  >
                                    {att.filename}
                                  </a>
                                  <span className="text-[10px] text-muted">
                                    {att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : 'Attachment'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <a
                                  href={`/api/files/download/${att.filename}`}
                                  download
                                  className="rounded-lg p-1 text-primary hover:bg-surface transition"
                                  title="Download"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                {isCreator && (
                                  <button
                                    onClick={() => handleDeleteAttachment(att.id)}
                                    className="rounded-lg p-1 text-red-500 hover:bg-red-50 transition"
                                    title="Delete attachment"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Vote Banner if already voted */}
                {userVote && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold">
                        ✓
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">You voted on this decision</p>
                        <p className="text-sm font-bold text-text-primary">
                          Your Choice: <strong>{userVote.optionText}</strong>
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/analysis"
                      className="rounded-xl border border-emerald-500/30 bg-surface px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
                    >
                      View in Analysis →
                    </Link>
                  </div>
                )}

                {/* Attached Poll Section */}
                {decision.poll && (
                  <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Attached Poll</p>
                        <h2 className="mt-1 text-xl font-black text-text-primary">{decision.poll.question}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-bold text-muted">
                          {decision.poll.options?.length || 0} Options
                        </span>
                        {isOpen && isCreator && !showAddOptionInput && (
                          <button
                            onClick={() => setShowAddOptionInput(true)}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary transition hover:bg-primary/20"
                            title="Add an option to this poll"
                          >
                            <span>+ Add Option</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Add Option Form */}
                    {isOpen && isCreator && showAddOptionInput && (
                      <form onSubmit={handleAddOption} className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">Add New Option to Poll</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddOptionInput(false);
                              setNewOptionText('');
                            }}
                            className="text-muted hover:text-text-primary text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newOptionText}
                            onChange={(e) => setNewOptionText(e.target.value)}
                            placeholder="Enter new option label or choice..."
                            className="app-input flex-1 py-2 px-3 text-xs bg-surface"
                            autoFocus
                            disabled={addingOption}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={addingOption || !newOptionText.trim()}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 shadow-sm"
                            >
                              {addingOption ? (
                                <>
                                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  <span>Adding...</span>
                                </>
                              ) : (
                                <span>Save Option</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddOptionInput(false);
                                setNewOptionText('');
                              }}
                              disabled={addingOption}
                              className="rounded-xl border border-border-default bg-surface px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-alt transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {decision.poll.options?.map((opt, idx) => {
                        const isUserOption = userVote && Number(userVote.optionId) === Number(opt.id);
                        return (
                          <div
                            key={opt.id || idx}
                            className={`flex items-center justify-between rounded-2xl border p-3.5 text-sm font-medium transition ${
                              isUserOption
                                ? 'border-primary bg-primary-soft text-primary font-bold shadow-sm'
                                : 'border-border-default bg-surface-alt text-text-primary'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border-default bg-surface text-[11px] font-bold text-muted">
                                {idx + 1}
                              </span>
                              {opt.optionText}
                            </span>

                            {isUserOption && (
                              <span className="rounded-lg bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-default">
                      <div className="flex flex-wrap items-center gap-2">
                        {isOpen && isCreator && !showAddOptionInput && (
                          <button
                            onClick={() => setShowAddOptionInput(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-surface-alt"
                          >
                            <span className="font-bold">+</span> Add Option
                          </button>
                        )}
                        {isOpen && isCreator && (
                          <button
                            onClick={handleCloseDecision}
                            disabled={closingDecision}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/20"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {closingDecision ? 'Closing...' : 'Close Poll / Finalize'}
                          </button>
                        )}
                      </div>

                      {isOpen && (
                        <Link
                          to={`/decisions/${id}/vote`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover ml-auto"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Open Voting Screen
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Multi-Criteria Comparison Matrix */}
                {decision.comparisonFactors && decision.comparisonFactors.length > 0 && (
                  <ComparisonMatrix
                    factors={decision.comparisonFactors}
                    optionScores={decision.optionScores || []}
                    options={decision.options || decision.poll?.options || []}
                  />
                )}

                {/* Threaded Discussion / Comment / Suggestions / Recommendations Section */}
                <CommentSection
                  decisionId={id}
                  pollOptions={decision.poll?.options || decision.options || []}
                />
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>

      {/* Content Flag / Moderation Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="DECISION"
        targetId={id}
        targetTitle={decision?.title}
      />
    </div>
  );
}
