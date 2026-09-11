/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ForgotPasswordPage.jsx
 * Architecture Tier: Page Component (View Layer)
 * Path: frontend/src/pages/ForgotPasswordPage.jsx
 *
 * Purpose:
 *   Password recovery page allowing users to request a password reset email link with secure verification tokens.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resetPasswordApi } from '../api/axiosClient';
import kidsStudyingIllustration from '../assets/kids-studying-from-home.svg';

const spring = {
  type: 'spring',
  stiffness: 180,
  damping: 18,
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPasswordApi(email);
      setIsSubmitted(true);
    } catch (err) {
      setFormError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Account recovery made simple.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
              Don&apos;t worry! Enter your email and we&apos;ll help you get back into your account in no time.
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
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-text-primary">Reset Password</h2>
              <p className="mt-2 text-sm text-muted">
                Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            {formError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
                <svg className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--error-text)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {isSubmitted ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Check your email</h3>
                  <p className="mt-2 text-sm text-muted">
                    We have sent password reset instructions to <span className="font-semibold text-primary">{email}</span>.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="block w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="demo@example.com"
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
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </motion.button>

                <p className="mt-6 text-center text-sm text-muted">
                  Remember your password?{' '}
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
