/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: SignupPage.jsx
 * Architecture Tier: Page Component (View Layer)
 * Path: frontend/src/pages/SignupPage.jsx
 *
 * Purpose:
 *   User registration page with input validation, password strength requirements, terms acceptance, and redirect to onboarding.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import kidsStudyingIllustration from '../assets/kids-studying-from-home.svg';

const spring = {
  type: 'spring',
  stiffness: 180,
  damping: 18,
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, loginWithGoogle, user, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password should be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setFormError('');
    clearError();

    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Google sign-up failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = formError || error;

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-primary md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-surface shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:grid-cols-2">
        
        {/* Left Hero Section with Graphics & Animation */}
        <section className="relative hidden overflow-hidden px-8 py-10 md:flex md:flex-col md:justify-between lg:px-12 lg:py-12" style={{ background: 'var(--hero-gradient)' }}>
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
              Join the team workspace.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
              Create an account to start hosting polls, gathering feedback, and deciding together.
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-center">
            <motion.img
              src={kidsStudyingIllustration}
              alt="Kids Studying from Home"
              className="h-auto w-full max-w-[28rem] drop-shadow-md select-none object-contain"
              animate={{
                y: isFocused ? -6 : [0, -6, 0],
                scale: isFocused ? 1.02 : 1,
              }}
              transition={{
                y: isFocused
                  ? { type: 'spring', stiffness: 200, damping: 15 }
                  : { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                scale: { type: 'spring', stiffness: 200, damping: 15 },
              }}
            />
          </div>
        </section>

        {/* Right Form Section */}
        <section className="flex items-center justify-center bg-surface px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-3xl font-black tracking-tight text-text-primary">Create account</h2>
              <p className="mt-2 text-sm text-muted">Get started with your DecisionHub account</p>
            </div>

            {activeError && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
                <svg className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{activeError}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="John Doe"
                  className="app-input px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="name@company.com"
                  className="app-input px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="At least 6 characters"
                    className="app-input px-4 py-3 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted hover:text-text-primary transition p-1.5 rounded-lg hover:bg-surface-alt/70"
                    title={showPassword ? 'Hide password' : 'View password'}
                    aria-label={showPassword ? 'Hide password' : 'View password'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Re-enter password"
                    className="app-input px-4 py-3 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted hover:text-text-primary transition p-1.5 rounded-lg hover:bg-surface-alt/70"
                    title={showConfirmPassword ? 'Hide confirm password' : 'View confirm password'}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'View confirm password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>

              <div className="flex items-center gap-4 py-1 text-sm text-muted">
                <span className="h-px flex-1 bg-surface-alt" />
                <span>or</span>
                <span className="h-px flex-1 bg-surface-alt" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border-default bg-surface px-4 py-3 font-semibold text-muted transition hover:bg-surface-alt disabled:opacity-70"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-sm font-black text-red-500 shadow-sm ring-1 ring-default">
                  G
                </span>
                Sign up with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
