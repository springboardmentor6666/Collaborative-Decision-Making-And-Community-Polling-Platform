/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: SkeletonCard.jsx
 * Architecture Tier: Design System Primitive (UI Layer)
 * Path: frontend/src/components/ui/SkeletonCard.jsx
 *
 * Purpose:
 *   Animated placeholder skeleton component used to prevent layout shifts during asynchronous data fetching.
 */

import React from 'react';

/**
 * SkeletonCard — Shimmer skeleton loader matching DecisionCard layout.
 * Variants: 'decision' (default), 'poll', 'comment', 'analysis'
 */
export default function SkeletonCard({ variant = 'decision', count = 1 }) {
  const cards = Array.from({ length: count }, (_, i) => i);

  if (variant === 'poll') {
    return (
      <div className="animate-pulse space-y-4 rounded-[2rem] border border-border-default bg-surface p-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-md bg-surface-alt" />
          <div className="h-5 w-16 rounded-md bg-surface-alt" />
        </div>
        <div className="h-6 w-3/4 rounded-lg bg-surface-alt" />
        <div className="h-3 w-1/3 rounded bg-surface-alt" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-border-default p-4">
              <div className="h-5 w-5 shrink-0 rounded-full bg-surface-alt" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-2/3 rounded bg-surface-alt" />
                <div className="h-3 w-1/3 rounded bg-surface-alt" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-12 w-full rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (variant === 'comment') {
    return (
      <div className="space-y-3">
        {cards.map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-surface-alt" />
              <div className="space-y-1">
                <div className="h-3.5 w-24 rounded bg-surface-alt" />
                <div className="h-2.5 w-16 rounded bg-surface-alt" />
              </div>
            </div>
            <div className="mt-3 space-y-1.5 pl-10">
              <div className="h-3 w-full rounded bg-surface-alt" />
              <div className="h-3 w-4/5 rounded bg-surface-alt" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'analysis') {
    return (
      <div className="space-y-4">
        {cards.map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border-default bg-surface p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-alt" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-surface-alt" />
                  <div className="h-3 w-24 rounded bg-surface-alt" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-surface-alt" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="h-2 flex-1 rounded-full bg-surface-alt" />
              <div className="h-4 w-10 rounded bg-surface-alt" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: decision card skeleton
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border-default bg-surface p-5 space-y-3"
        >
          {/* Badges row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-14 rounded-full bg-surface-alt" />
              <div className="h-5 w-20 rounded-full bg-surface-alt" />
            </div>
            <div className="h-6 w-6 rounded-xl bg-surface-alt" />
          </div>
          {/* Title */}
          <div className="space-y-1.5">
            <div className="h-5 w-4/5 rounded-lg bg-surface-alt" />
            <div className="h-5 w-2/5 rounded-lg bg-surface-alt" />
          </div>
          {/* Description */}
          <div className="space-y-1">
            <div className="h-3.5 w-full rounded bg-surface-alt" />
            <div className="h-3.5 w-3/4 rounded bg-surface-alt" />
          </div>
          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border-default/40 pt-3">
            <div className="h-3 w-16 rounded bg-surface-alt" />
            <div className="h-3 w-20 rounded bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  );
}
