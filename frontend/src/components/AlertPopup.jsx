/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: AlertPopup.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/AlertPopup.jsx
 *
 * Purpose:
 *   Modal alert and confirmation dialog component displaying warning, error, or confirmation messages with action buttons.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertPopup({
  isOpen,
  title,
  message,
  type = 'error', // 'error' | 'confirm' | 'warning' | 'info'
  confirmText = 'OK',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  const primaryButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the primary button for accessibility
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (type === 'confirm' && onCancel) {
            onCancel();
          } else if (onClose) {
            onClose();
          }
        } else if (e.key === 'Enter') {
          // Let Enter activate the focused button or trigger confirmation
          if (document.activeElement?.tagName !== 'BUTTON') {
            e.preventDefault();
            if (type === 'confirm' && onConfirm) {
              onConfirm();
            } else if (onClose) {
              onClose();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, type, onConfirm, onCancel, onClose]);

  const handleBackdropClick = () => {
    if (type === 'confirm' && onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const isConfirmation = type === 'confirm';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="alert-popup-title"
          aria-describedby="alert-popup-desc"
        >
          {/* Backdrop with dimming and blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={handleBackdropClick}
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border-default bg-surface p-6 shadow-2xl"
          >
            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              {isConfirmation ? (
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${
                    isDangerous
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 shadow-sm">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3
                  id="alert-popup-title"
                  className="text-base font-bold text-text-primary tracking-tight"
                >
                  {title || (isConfirmation ? 'Confirm Action' : 'Something went wrong')}
                </h3>
                <p
                  id="alert-popup-desc"
                  className="mt-1.5 text-sm text-text-secondary leading-relaxed break-words"
                >
                  {message || 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border-default">
              {isConfirmation && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {cancelText}
                </button>
              )}

              <button
                ref={primaryButtonRef}
                type="button"
                id="alert-popup-ok-btn"
                onClick={isConfirmation ? onConfirm : onClose}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isConfirmation && isDangerous
                    ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
                    : 'app-button hover:brightness-110 focus:ring-primary'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
