import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createDecisionApi } from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import CategorySelector from '../components/CategorySelector';

export default function CreateDecision() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuth();
  
  const communityId = location.state?.communityId;
  const communityName = location.state?.communityName;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [categoryId, setCategoryId] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // MCDA state
  const [enableMcda, setEnableMcda] = useState(false);
  const [factors, setFactors] = useState(['Cost / Budget', 'Feasibility & Speed', 'Impact']);
  const [matrixScores, setMatrixScores] = useState({}); // { [optionIdx]: { [factorIdx]: score } }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (pollOptions.length < 8) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length <= 2) {
      setError('A poll must have at least 2 options.');
      return;
    }
    setError('');
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleAddFactor = () => {
    if (factors.length < 6) {
      setFactors([...factors, '']);
    }
  };

  const handleFactorChange = (index, value) => {
    const updated = [...factors];
    updated[index] = value;
    setFactors(updated);
  };

  const handleRemoveFactor = (index) => {
    if (factors.length <= 1) return;
    setFactors(factors.filter((_, i) => i !== index));
  };

  const handleScoreChange = (optIdx, factorIdx, value) => {
    const scoreNum = Math.min(10, Math.max(1, Number(value) || 0));
    setMatrixScores((prev) => ({
      ...prev,
      [optIdx]: {
        ...(prev[optIdx] || {}),
        [factorIdx]: scoreNum,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (pollQuestion.trim() && trimmedOptions.length < 2) {
      setError('Please provide at least 2 poll options.');
      return;
    }

    const trimmedFactors = factors.map((f) => f.trim()).filter(Boolean);

    // Build option scores payload if MCDA enabled
    const optionScoresPayload = [];
    if (enableMcda && trimmedFactors.length > 0 && trimmedOptions.length > 0) {
      trimmedOptions.forEach((optLabel, optIdx) => {
        trimmedFactors.forEach((factorName, fIdx) => {
          const score = matrixScores[optIdx]?.[fIdx] ?? 5;
          optionScoresPayload.push({
            optionLabel: optLabel,
            factorName: factorName,
            score: score,
          });
        });
      });
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        categoryId: categoryId || null,
        pollQuestion: pollQuestion.trim() || null,
        pollOptions: pollQuestion.trim() ? trimmedOptions : null,
        communityId,
        comparisonFactorNames: enableMcda ? trimmedFactors : null,
        optionScores: enableMcda ? optionScoresPayload : null,
      };

      const created = await createDecisionApi(payload, accessToken, user);
      navigate(`/decisions/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'app-input px-4 py-3 text-xs sm:text-sm';
  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted';

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
            {/* Back link */}
            <Link
              to="/dashboard"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-primary">Create Decision</h1>
              <p className="mt-1 text-secondary">Define your decision, categorize it, and attach structured evaluation tools.</p>
              {communityName && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Posting in {communityName}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
                <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Decision Info Card */}
              <div className="rounded-[2rem] border border-default bg-surface p-6 shadow-sm space-y-5">
                <div>
                  <label className={labelClass}>Decision Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Choose Database Architecture for Q4"
                    className={inputClass}
                  />
                </div>

                {/* Category Selection */}
                <CategorySelector
                  selectedCategoryId={categoryId}
                  onChange={(id) => setCategoryId(id)}
                />

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the background, constraints, and goal of this decision..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="OPEN">OPEN — Accepting Votes</option>
                    <option value="CLOSED">CLOSED — View Only</option>
                  </select>
                </div>
              </div>

              {/* Poll Card */}
              <div className="rounded-[2rem] border border-default bg-surface p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-primary">Attach Poll</h2>
                  <p className="mt-1 text-sm text-secondary">Optional. Add a structured voting poll to this decision.</p>
                </div>

                <div>
                  <label className={labelClass}>Poll Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Which database should we adopt?"
                    className={inputClass}
                  />
                </div>

                {pollQuestion.trim() && (
                  <div className="space-y-3">
                    <label className={labelClass}>Poll Options</label>
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="rounded-xl border border-default bg-surface p-2 text-secondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {pollOptions.length < 8 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add another option
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Multi-Criteria Decision Analysis (MCDA) Card */}
              <div className="rounded-[2rem] border border-default bg-surface p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-primary">
                      Multi-Criteria Comparison Matrix (MCDA)
                    </h2>
                    <p className="mt-1 text-sm text-secondary">
                      Evaluate and score options across custom decision factors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableMcda(!enableMcda)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      enableMcda
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-alt border border-border-default text-muted hover:text-text-primary'
                    }`}
                  >
                    {enableMcda ? '✓ Matrix Enabled' : '+ Enable Matrix'}
                  </button>
                </div>

                <AnimatePresence>
                  {enableMcda && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden pt-2 border-t border-border-default"
                    >
                      <div>
                        <label className={labelClass}>Decision Factors / Criteria</label>
                        <div className="space-y-2">
                          {factors.map((factor, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={factor}
                                onChange={(e) => handleFactorChange(fIdx, e.target.value)}
                                placeholder={`Factor ${fIdx + 1} (e.g. Cost, Speed, Feasibility)`}
                                className={`${inputClass} flex-1`}
                              />
                              {factors.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFactor(fIdx)}
                                  className="rounded-xl border border-default bg-surface p-2 text-secondary hover:text-red-500"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}

                          {factors.length < 6 && (
                            <button
                              type="button"
                              onClick={handleAddFactor}
                              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              + Add comparison factor
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Score Matrix Preview if options exist */}
                      {pollOptions.filter((o) => o.trim()).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border-default">
                          <label className={labelClass}>Assign Option Scores (1 - 10)</label>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-border-default text-muted">
                                  <th className="py-2 px-2">Option</th>
                                  {factors.filter((f) => f.trim()).map((f, i) => (
                                    <th key={i} className="py-2 px-2 text-center">{f}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-default">
                                {pollOptions.filter((o) => o.trim()).map((opt, optIdx) => (
                                  <tr key={optIdx}>
                                    <td className="py-2.5 px-2 font-bold text-text-primary">{opt}</td>
                                    {factors.filter((f) => f.trim()).map((_, fIdx) => (
                                      <td key={fIdx} className="py-2 px-2 text-center">
                                        <input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={matrixScores[optIdx]?.[fIdx] ?? 5}
                                          onChange={(e) => handleScoreChange(optIdx, fIdx, e.target.value)}
                                          className="w-14 rounded-lg border border-border-default bg-surface px-2 py-1 text-center font-bold text-xs"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-xl border border-border-default bg-surface px-5 py-2.5 text-sm font-bold text-muted transition hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Decision</span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
