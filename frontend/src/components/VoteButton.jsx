/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: VoteButton.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/VoteButton.jsx
 *
 * Purpose:
 *   Interactive animated voting button component with active selection states, hover micro-animations, and loading spinners.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VoteButton — Enhanced primary button with success confetti burst.
 */
const VoteButton = ({ onClick, disabled, isLoading }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      await onClick();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold text-white shadow-app transition-all duration-200 disabled:opacity-70 ${
          disabled && !isLoading
            ? 'shadow-none cursor-not-allowed'
            : 'bg-primary hover:bg-primary-hover'
        }`}
        style={disabled && !isLoading ? { backgroundColor: 'var(--disabled-bg)' } : {}}
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Submitting Vote...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Submit Vote</span>
          </>
        )}
      </motion.button>

      {/* Confetti Burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const distance = 40 + Math.random() * 30;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x, y: y - 20, scale: 0, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoteButton;
