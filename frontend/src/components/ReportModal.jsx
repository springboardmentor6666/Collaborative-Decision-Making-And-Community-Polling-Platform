import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { flagContentApi } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  'Spam or promotional content',
  'Hate speech or abusive language',
  'Harassment or personal attack',
  'Misleading or false information',
  'Inappropriate or offensive content',
  'Other violation',
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType = 'DECISION', // 'DECISION' | 'COMMENT'
  targetId,
  targetTitle = '',
}) {
  const { accessToken } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fullReason = customNotes.trim()
      ? `${selectedReason}: ${customNotes.trim()}`
      : selectedReason;

    try {
      await flagContentApi(targetType, targetId, fullReason.substring(0, 255), accessToken);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-border-default bg-surface p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10">
                🚩
              </span>
              <h3 className="text-base font-bold text-text-primary">
                Report {targetType === 'DECISION' ? 'Decision' : 'Comment'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-muted hover:bg-surface-alt hover:text-text-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {targetTitle && (
            <p className="mb-4 text-xs text-muted line-clamp-1">
              Reporting: <strong className="text-text-primary font-semibold">{targetTitle}</strong>
            </p>
          )}

          {success ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm font-bold text-emerald-600">
              ✓ Thank you. This item has been flagged for moderation review.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Reason for Report
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs transition ${
                        selectedReason === r
                          ? 'border-primary bg-primary-soft text-primary font-bold'
                          : 'border-border-default bg-surface hover:bg-surface-alt text-text-primary'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r}
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Provide context for the moderators..."
                  className="app-input w-full p-2.5 text-xs"
                  maxLength={150}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border-default px-4 py-2 text-xs font-bold text-muted hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Flag'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
