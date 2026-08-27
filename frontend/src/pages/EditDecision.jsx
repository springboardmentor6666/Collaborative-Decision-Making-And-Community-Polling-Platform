import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchDecisionById, updateDecisionApi } from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import CategorySelector from '../components/CategorySelector';
import Loader from '../components/Loader';

export default function EditDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [categoryId, setCategoryId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadDecision() {
      try {
        setLoading(true);
        const data = await fetchDecisionById(id, accessToken);
        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setStatus(data.status || 'OPEN');
          setVisibility(data.visibility || (data.status === 'CLOSED' ? 'PRIVATE' : 'PUBLIC'));
          setCategoryId(data.categoryId || null);
        }
      } catch (err) {
        setError('Failed to load decision for editing.');
      } finally {
        setLoading(false);
      }
    }

    loadDecision();
  }, [id, accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || null,
        status: status,
        visibility: visibility,
      };

      await updateDecisionApi(id, payload, accessToken);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/decisions/${id}`);
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to update decision. Please try again.');
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
              to={`/decisions/${id}`}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Decision Details
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-text-primary">Edit Decision</h1>
              <p className="mt-1 text-secondary">
                Modify your decision information, category assignment, and voting status.
              </p>
            </div>

            {loading ? (
              <Loader message="Loading decision data..." />
            ) : (
              <>
                {/* Success Notification */}
                {success && (
                  <div className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                    <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Decision updated successfully! Redirecting...</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div
                    className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm"
                    style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
                  >
                    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-5">
                    {/* Title */}
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

                    {/* Category */}
                    <CategorySelector
                      selectedCategoryId={categoryId}
                      onChange={(newId) => setCategoryId(newId)}
                    />

                    {/* Description */}
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain the background, constraints, and goal of this decision..."
                        className={inputClass}
                      />
                    </div>

                    {/* Status & Visibility Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Decision Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className={inputClass}
                        >
                          <option value="OPEN">OPEN — Accepting Votes</option>
                          <option value="CLOSED">CLOSED — Concluded / View Only</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Visibility</label>
                        <select
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value)}
                          className={inputClass}
                        >
                          <option value="PUBLIC">PUBLIC — Open to Community</option>
                          <option value="PRIVATE">PRIVATE — Restricted Access</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/decisions/${id}`)}
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
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
