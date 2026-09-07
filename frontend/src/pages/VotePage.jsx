import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchDecisionById,
  castVoteApi,
  getMyVotesAnalysisApi,
  recordImpressionApi,
  getRatingSummaryApi,
} from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import PollCard from '../components/PollCard';
import SkeletonCard from '../components/ui/SkeletonCard';

export default function VotePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();

  const [decision, setDecision] = useState(null);
  
  // Voting states
  const [selectedOptionId, setSelectedOptionId] = useState(null); // Single choice
  const [selectedOptionIds, setSelectedOptionIds] = useState([]); // Multiple choice
  const [ratings, setRatings] = useState({}); // { [optionId]: rating } for Rating polls
  const [rankedOptions, setRankedOptions] = useState([]); // Ranked choice options order
  const [isAnonymousVote, setIsAnonymousVote] = useState(false);
  const [ratingSummary, setRatingSummary] = useState(null);

  // Private Access Token state
  const tokenFromUrl = searchParams.get('token') || searchParams.get('accessCode') || '';
  const [accessTokenInput, setAccessTokenInput] = useState(tokenFromUrl);
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(!!tokenFromUrl);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dec = await fetchDecisionById(id, accessToken);
      setDecision(dec);
      if (dec?.poll?.options) {
        setRankedOptions(dec.poll.options);
      }

      // Record a view impression
      await recordImpressionApi(id, 'VIEW', accessToken);

      // If poll is rating type, fetch rating summary
      if (dec.poll && dec.poll.pollType === 'RATING') {
        try {
          const rSum = await getRatingSummaryApi(dec.poll.id, accessToken);
          setRatingSummary(rSum);
        } catch {
          // ignore
        }
      }

      // Check if user has already voted
      if (accessToken) {
        try {
          const votesAnalysis = await getMyVotesAnalysisApi(accessToken);
          const existingVote = votesAnalysis.find((v) => String(v.decisionId) === String(id));
          if (existingVote) {
            setSelectedOptionId(existingVote.userChoice?.optionId);
            setHasVoted(true);
          }
        } catch (e) {
          // ignore
        }
      }
    } catch {
      setError('Could not load decision or poll details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOption = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleRateOption = (optionId, score) => {
    setRatings((prev) => ({
      ...prev,
      [optionId]: score,
    }));
  };

  const handleVote = async () => {
    if (!decision || !decision.poll) return;
    setError(null);
    setSubmitting(true);

    const pollType = (decision.poll.pollType || 'SINGLE_CHOICE').toUpperCase();
    const isMulti = pollType === 'MULTIPLE' || pollType === 'MULTI';
    const isRating = pollType === 'RATING';
    const isRanked = pollType === 'RANKED_CHOICE' || pollType === 'RANKED';

    try {
      if (isMulti) {
        if (selectedOptionIds.length === 0) {
          setError('Please select at least one option to vote.');
          setSubmitting(false);
          return;
        }

        const votesPayload = selectedOptionIds.map((optId) => ({
          pollId: Number(decision.poll.id || id),
          pollOptionId: Number(optId),
          isAnonymous: isAnonymousVote,
        }));

        await castVoteApi(
          {
            decisionId: Number(id),
            pollId: Number(decision.poll.id || id),
            votes: votesPayload,
            isAnonymous: isAnonymousVote,
          },
          accessToken
        );
      } else if (isRating) {
        const ratedKeys = Object.keys(ratings);
        if (ratedKeys.length === 0) {
          setError('Please provide a rating for at least one option.');
          setSubmitting(false);
          return;
        }

        const votesPayload = ratedKeys.map((optId) => ({
          pollId: Number(decision.poll.id || id),
          pollOptionId: Number(optId),
          rating: Number(ratings[optId]),
          isAnonymous: isAnonymousVote,
        }));

        await castVoteApi(
          {
            decisionId: Number(id),
            pollId: Number(decision.poll.id || id),
            votes: votesPayload,
            isAnonymous: isAnonymousVote,
          },
          accessToken
        );

        // Refresh rating summary
        try {
          const rSum = await getRatingSummaryApi(decision.poll.id, accessToken);
          setRatingSummary(rSum);
        } catch {
          // ignore
        }
      } else if (isRanked) {
        const currentRanked = rankedOptions.length > 0 ? rankedOptions : (decision.poll.options || []);
        if (currentRanked.length === 0) {
          setError('No options available to rank.');
          setSubmitting(false);
          return;
        }

        const votesPayload = currentRanked.map((opt, index) => ({
          pollId: Number(decision.poll.id || id),
          pollOptionId: Number(opt.id),
          ranking: index + 1,
          isAnonymous: isAnonymousVote,
        }));

        await castVoteApi(
          {
            decisionId: Number(id),
            pollId: Number(decision.poll.id || id),
            votes: votesPayload,
            isAnonymous: isAnonymousVote,
          },
          accessToken
        );
      } else {
        // Single Choice
        if (!selectedOptionId) {
          setError('Please select an option to vote.');
          setSubmitting(false);
          return;
        }

        const selectedOption = decision.poll?.options?.find(
          (opt) => Number(opt.id) === Number(selectedOptionId)
        );
        const optionText = selectedOption ? selectedOption.optionText : 'Selected Choice';

        await castVoteApi(
          {
            decisionId: Number(id),
            pollId: Number(decision.poll.id || id),
            optionId: Number(selectedOptionId),
            pollOptionId: Number(selectedOptionId),
            isAnonymous: isAnonymousVote,
          },
          accessToken,
          {
            optionText,
            decisionTitle: decision.title,
            pollQuestion: decision.poll?.question || decision.title,
            userEmail: user?.email || 'user@example.com',
          }
        );
      }

      setSuccessMsg('Your vote has been recorded! Added to your Decision Analysis.');
      setHasVoted(true);
      setShowSuccessModal(true);
      showToast?.('Ballot successfully submitted!', 'success');
    } catch (err) {
      if (err.message?.includes('already voted') || err.message?.includes('409')) {
        setError('You have already voted on this decision.');
        setHasVoted(true);
      } else {
        setError(err.message || 'Failed to submit vote. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isPrivateDecision = decision?.visibility === 'PRIVATE' || decision?.status === 'PRIVATE';
  const showPrivateGate = isPrivateDecision && !isPrivateUnlocked;

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
            {loading ? (
              <SkeletonCard variant="poll" />
            ) : !decision ? (
              <div className="rounded-2xl border border-dashed border-default p-12 text-center">
                <p className="mb-4 text-secondary">Decision not found.</p>
                <Link to="/dashboard" className="text-sm font-bold text-primary hover:underline">
                  Return to Dashboard
                </Link>
              </div>
            ) : showPrivateGate ? (
              /* Private Voting Access Token Gate */
              <div className="rounded-[2rem] border border-border-default bg-surface p-8 shadow-sm text-center space-y-5 max-w-lg mx-auto">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">
                  🔒
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-primary">Private Decision</h2>
                  <p className="mt-1 text-sm text-muted">
                    This decision ballot is private. Please provide an access token or invite code to participate.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                    Access Token / Passcode
                  </label>
                  <input
                    type="text"
                    value={accessTokenInput}
                    onChange={(e) => setAccessTokenInput(e.target.value)}
                    placeholder="e.g. priv_token_xyz"
                    className="app-input px-4 py-3"
                  />
                  <button
                    onClick={() => {
                      if (accessTokenInput.trim()) {
                        setIsPrivateUnlocked(true);
                      } else {
                        setError('Please enter a valid access token.');
                      }
                    }}
                    className="w-full rounded-2xl bg-primary py-3 font-bold text-white shadow-app transition hover:bg-primary-hover"
                  >
                    Unlock Voting Ballot
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back link */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/decisions/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Decision Details
                  </Link>

                  {hasVoted && (
                    <Link
                      to="/analysis"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
                    >
                      📊 View Outcome in Analysis →
                    </Link>
                  )}
                </div>

                {/* Page title */}
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-primary">Cast Your Vote</h1>
                  <p className="mt-1 text-secondary">{decision.title}</p>
                </div>

                {/* Anonymous Voting Switch on Ballot */}
                {!hasVoted && (
                  <div className="flex items-center justify-between rounded-2xl border border-border-default bg-surface p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-base">
                        🕵️
                      </span>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Vote Anonymously</p>
                        <p className="text-xs text-muted">Keep your choice private on the public participant roster.</p>
                      </div>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isAnonymousVote}
                        onChange={(e) => setIsAnonymousVote(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-border-default peer-checked:bg-primary transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-3 rounded-2xl p-4 text-sm"
                    style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
                  >
                    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {successMsg && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{successMsg}</span>
                    </div>
                    <Link to="/analysis" className="font-bold underline hover:opacity-80">
                      Open Analysis Page
                    </Link>
                  </div>
                )}

                {/* Dynamic Poll Card */}
                <PollCard
                  poll={decision.poll}
                  decisionId={decision.id}
                  selectedOptionId={selectedOptionId}
                  selectedOptionIds={selectedOptionIds}
                  ratings={ratings}
                  ratingSummary={ratingSummary}
                  rankedOptions={rankedOptions}
                  onSelectOption={(optId) => setSelectedOptionId(optId)}
                  onToggleOption={handleToggleOption}
                  onRateOption={handleRateOption}
                  onReorder={(newOrder) => setRankedOptions(newOrder)}
                  onVote={handleVote}
                  isSubmitting={submitting}
                  hasVoted={hasVoted}
                />
              </div>
            )}
          </div>

          {/* Animated Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
                onClick={() => setShowSuccessModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-md rounded-[2.5rem] border border-border-default bg-surface p-8 text-center shadow-2xl space-y-6"
                >
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-text-primary">Vote Recorded!</h3>
                    <p className="mt-2 text-sm text-muted">
                      Your vote on <strong className="text-text-primary">"{decision?.title}"</strong> has been securely submitted and added to your personal decision records.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <Link
                      to="/analysis"
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                    >
                      📊 View Outcome in Decision Analysis
                    </Link>
                    <Link
                      to={`/decisions/${id}`}
                      className="w-full rounded-2xl border border-border-default bg-surface-alt/60 py-3 text-sm font-bold text-text-primary transition hover:bg-surface-alt"
                    >
                      Back to Decision Overview
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowSuccessModal(false)}
                      className="text-xs font-semibold text-muted hover:text-text-primary transition pt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Footer />
        </main>
      </div>
    </div>
  );
}
