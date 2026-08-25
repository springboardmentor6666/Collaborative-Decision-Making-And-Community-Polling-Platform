import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordConfirmApi } from '../api/axiosClient';

const spring = {
  type: 'spring',
  stiffness: 180,
  damping: 18,
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromQuery = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!token.trim()) {
      setFormError('A valid password reset token is required. Please check your reset link.');
      return;
    }

    if (!newPassword) {
      setFormError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPasswordConfirmApi(token.trim(), newPassword);
      setIsSubmitted(true);
    } catch (err) {
      setFormError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-primary md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-surface shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:grid-cols-2">
        
        {/* Left Hero Section with Graphics */}
        <section
          className="relative hidden overflow-hidden px-8 py-10 md:flex md:flex-col md:justify-between lg:px-12 lg:py-12"
          style={{ background: 'var(--hero-gradient)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{
                x: isFocused ? 16 : 0,
                y: isFocused ? -12 : 0,
                scale: isFocused ? 1.06 : 1,
              }}
              transition={spring}
              className="absolute left-8 top-10 h-32 w-32 rounded-full blur-3xl"
              style={{ backgroundColor: 'var(--primary-soft)', opacity: 0.5 }}
            />
            <motion.div
              animate={{
                x: isFocused ? -18 : 0,
                y: isFocused ? 10 : 0,
                scale: isFocused ? 1.08 : 1,
              }}
              transition={spring}
              className="absolute bottom-16 right-12 h-40 w-40 rounded-full blur-3xl"
              style={{ backgroundColor: 'var(--primary-soft)', opacity: 0.4 }}
            />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
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
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">DecisionHub</h1>
              <p className="text-sm text-muted">Decide together</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-5xl font-black tracking-tight text-primary lg:text-6xl">
              Set your new password.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
              Choose a strong and secure password to protect your account and collaborate safely.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl bg-surface/60 p-4 backdrop-blur-md border border-border-default">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Password Security Tip</p>
              <p className="text-xs text-muted">Use at least 6 characters with a combination of letters and numbers.</p>
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="flex items-center justify-center bg-surface px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-text-primary">Create New Password</h2>
              <p className="mt-2 text-sm text-muted">
                Enter and confirm your new password below.
              </p>
            </div>

            {formError && (
              <div
                className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
              >
                <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {isSubmitted ? (
              <div className="space-y-6 text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Password Reset Complete!</h3>
                  <p className="mt-2 text-sm text-muted">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="block w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white shadow-app transition hover:bg-primary-hover text-center"
                >
                  Sign In with New Password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!tokenFromQuery && (
                  <div>
                    <label htmlFor="reset-token" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      Reset Token
                    </label>
                    <input
                      id="reset-token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your reset token"
                      className="app-input px-4 py-3"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="new-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="At least 6 characters"
                      className="app-input px-4 py-3 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-text-primary"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Re-type your new password"
                    className="app-input px-4 py-3"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-bold text-white shadow-app transition hover:bg-primary-hover disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.button>

                <p className="mt-6 text-center text-sm text-muted">
                  Remembered your credentials?{' '}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
