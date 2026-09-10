/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Loader.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/Loader.jsx
 *
 * Purpose:
 *   Branded custom loader matching PageTransition design system with rotating DecisionHub badge,
 *   ambient floating glow orbs, animated buffer progress bar, and inspirational quotes.
 */

import { motion } from 'framer-motion';

const quotes = [
  'Great decisions start with great conversations...',
  'Bringing your team\'s ideas together...',
  'Your collaborative workspace is loading...',
  'Empowering smarter choices, one vote at a time...',
  'Where every voice matters in every decision...',
  'Building consensus, creating impact...',
  'Transform ideas into actionable decisions...',
  'Collaboration is the key to innovation...',
];

export default function Loader({
  fullScreen = false,
  message = 'Loading data...',
  compact = false,
}) {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--loader-bg, var(--background))' }}
      >
        {/* Ambient floating blurred glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 25, -20, 0],
              y: [0, -15, 12, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[12%] top-[18%] h-44 w-44 rounded-full blur-3xl"
            style={{ backgroundColor: 'var(--primary-soft)', opacity: 0.55 }}
          />
          <motion.div
            animate={{
              x: [0, -20, 18, 0],
              y: [0, 12, -18, 0],
              scale: [1, 0.92, 1.12, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[18%] right-[12%] h-52 w-52 rounded-full blur-3xl"
            style={{ backgroundColor: 'var(--primary-soft)', opacity: 0.45 }}
          />
        </div>

        {/* Main Glassmorphic Card Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-5 px-6"
        >
          {/* Glassmorphic Logo Container */}
          <div
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border-default backdrop-blur-2xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--surface) 65%, transparent)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <div className="logo-color-shift flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-app">
                <svg viewBox="0 0 48 48" className="h-8 w-8 text-white" aria-hidden="true">
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
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
            </motion.div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight text-text-primary">DecisionHub</h2>
            {message && <p className="mt-1 text-xs font-semibold text-primary">{message}</p>}
          </div>

          {/* Buffer Progress Shimmer Bar */}
          <div className="h-1 w-44 overflow-hidden rounded-full bg-surface-alt backdrop-blur-sm">
            <div className="buffer-progress h-full w-full rounded-full" />
          </div>

          <p className="max-w-xs text-center text-xs font-medium italic text-muted">
            "{quote}"
          </p>
        </motion.div>
      </div>
    );
  }

  // Inline / Section / Card loader for data fetching inside views
  return (
    <div
      className={`flex w-full flex-col items-center justify-center ${
        compact ? 'py-6' : 'py-12 sm:py-16'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-3.5"
      >
        {/* Animated Brand Badge */}
        <div
          className={`flex items-center justify-center rounded-2xl border border-border-default backdrop-blur-xl ${
            compact ? 'h-12 w-12' : 'h-16 w-16'
          }`}
          style={{
            backgroundColor: 'color-mix(in srgb, var(--surface) 75%, transparent)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className={`logo-color-shift flex items-center justify-center rounded-xl bg-primary shadow-xs ${
                compact ? 'h-8 w-8' : 'h-10 w-10'
              }`}
            >
              <svg
                viewBox="0 0 48 48"
                className={`text-white ${compact ? 'h-4 w-4' : 'h-5 w-5'}`}
                aria-hidden="true"
              >
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
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
          </motion.div>
        </div>

        {/* Shimmer Buffer Progress Bar */}
        <div
          className={`overflow-hidden rounded-full bg-surface-alt ${
            compact ? 'h-1 w-24' : 'h-1 w-36'
          }`}
        >
          <div className="buffer-progress h-full w-full rounded-full" />
        </div>

        {/* Message */}
        {message && (
          <p className="text-center text-xs font-semibold text-muted">
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
