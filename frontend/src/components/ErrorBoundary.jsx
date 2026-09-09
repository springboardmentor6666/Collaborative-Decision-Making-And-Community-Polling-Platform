/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ErrorBoundary.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/ErrorBoundary.jsx
 *
 * Purpose:
 *   React error boundary catching component tree rendering errors and displaying a graceful fallback UI with reload options.
 */

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-text-primary">
          <div className="max-w-md w-full rounded-3xl border border-border-default bg-surface p-8 shadow-2xl text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-text-primary">Something went wrong</h2>
              <p className="text-xs text-muted leading-relaxed">
                An unexpected display issue occurred. Return to your dashboard to continue.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="rounded-xl border border-border-default bg-surface-alt p-3 text-left">
                <p className="text-[11px] font-mono text-muted break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition active:scale-95"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
