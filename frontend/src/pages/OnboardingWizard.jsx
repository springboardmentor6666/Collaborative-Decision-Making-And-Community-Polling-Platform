import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateUserProfileApi, updateUserInterestsApi } from '../api/axiosClient';
import InterestTaxonomyEditor from '../components/InterestTaxonomyEditor';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !name.trim()) {
      setError('Please provide your name.');
      return;
    }
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrevStep = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.id && accessToken) {
        // Save profile details
        await updateUserProfileApi(
          user.id,
          { name: name.trim(), bio: bio.trim(), avatar },
          accessToken
        );

        // Save interests if any selected
        if (selectedInterests.length > 0) {
          await updateUserInterestsApi(selectedInterests, accessToken);
        }
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Even if API fails in dev mode, allow proceeding
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-app mb-3">
            <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                <circle cx="10" cy="24" r="4" fill="currentColor" stroke="none" />
                <circle cx="24" cy="10" r="4" fill="currentColor" stroke="none" />
                <circle cx="38" cy="24" r="4" fill="currentColor" stroke="none" />
                <circle cx="24" cy="38" r="4" fill="currentColor" stroke="none" />
                <path d="M13 21L21 13" />
                <path d="M27 13L35 21" />
                <path d="M13 27L21 35" />
                <path d="M27 35L35 27" />
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">Welcome to DecisionHub</h1>
          <p className="mt-1 text-sm text-muted">Let's set up your profile and personal preferences in 3 quick steps.</p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-8 flex items-center justify-between">
          {[
            { num: 1, label: 'Profile Setup' },
            { num: 2, label: 'Topic Interests' },
            { num: 3, label: 'Get Started' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black transition-all ${
                    step === s.num
                      ? 'bg-primary text-white shadow-app ring-4 ring-primary-soft'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-surface-alt border border-border-default text-muted'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="mt-1 text-[11px] font-bold text-text-primary">{s.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={`h-1 flex-1 mx-3 rounded-full transition-all ${
                    step > s.num ? 'bg-emerald-500' : 'bg-border-default'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Wizard Card Container */}
        <div className="rounded-[2.5rem] border border-border-default bg-surface p-6 sm:p-8 shadow-sm space-y-6">
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

          <AnimatePresence mode="wait">
            {/* Step 1: Profile Essentials */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-black text-text-primary">Personalize your presence</h2>
                  <p className="mt-1 text-xs text-muted">Choose an avatar and tell other community members about yourself.</p>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    Choose Avatar
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Preset avatar"
                        onClick={() => setAvatar(url)}
                        className={`h-12 w-12 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                          avatar === url
                            ? 'ring-4 ring-primary shadow-md scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="app-input px-4 py-3"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    Bio / Role
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Engineering Lead interested in architecture and product governance."
                    className="app-input px-4 py-3"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Topics of Interest */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-black text-text-primary">What topics interest you most?</h2>
                  <p className="mt-1 text-xs text-muted">
                    We'll tailor your dashboard recommendations and community polls to your interests.
                  </p>
                </div>

                <InterestTaxonomyEditor
                  selectedIds={selectedInterests}
                  onSelectionChange={(ids) => setSelectedInterests(ids)}
                  autoSave={false}
                />
              </motion.div>
            )}

            {/* Step 3: Confirmation & Next Steps */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center py-4"
              >
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-emerald-500/10 text-3xl">
                  🚀
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-primary">You're All Set!</h2>
                  <p className="mt-2 text-sm text-muted max-w-md mx-auto">
                    Your profile is configured. You can start creating collaborative decisions, casting your votes on community polls, and exploring analytics.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-default bg-surface-alt p-4 text-left space-y-2">
                  <p className="text-xs font-bold text-text-primary">Summary:</p>
                  <p className="text-xs text-muted">• Display Name: <strong className="text-text-primary">{name}</strong></p>
                  <p className="text-xs text-muted">• Topics Selected: <strong className="text-text-primary">{selectedInterests.length} categories</strong></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Actions */}
          <div className="flex items-center justify-between border-t border-border-default pt-6">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="rounded-xl border border-border-default bg-surface px-4 py-2.5 text-xs font-bold text-muted hover:bg-surface-alt transition"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs font-semibold text-muted hover:text-text-primary"
                >
                  Skip for now
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-app hover:bg-primary-hover transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-app hover:bg-emerald-700 disabled:opacity-70 transition"
                >
                  {loading ? 'Completing Profile...' : 'Complete & Go to Dashboard ✨'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
