/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Toast.jsx
 * Architecture Tier: Design System Primitive (UI Layer)
 * Path: frontend/src/components/ui/Toast.jsx
 *
 * Purpose:
 *   Floating notification toast component rendering auto-dismissing success, info, warning, and error messages.
 */

import React from 'react';
import { useToast, ToastProvider } from '../../context/ToastContext';

export { useToast, ToastProvider };

/**
 * Standalone Toast UI component preview / badge
 */
export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-default bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-xl">
      <span className="text-sm font-semibold text-text-primary">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      )}
    </div>
  );
}
