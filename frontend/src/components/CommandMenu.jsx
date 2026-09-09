/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: CommandMenu.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/CommandMenu.jsx
 *
 * Purpose:
 *   Keyboard-driven command palette (Cmd+K / Ctrl+K) providing instant navigation, search, and action execution across the platform.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { globalSearchApi } from '../api/axiosClient';

/**
 * CommandMenu — Global spotlight search modal (Ctrl+K / Cmd+K).
 * Queries /api/search and displays grouped results with keyboard navigation.
 */
export default function CommandMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setActiveIndex(0);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearchApi(query.trim(), 'all', accessToken);
        setResults(data);
        setActiveIndex(0);
      } catch {
        setResults({ decisions: [], communities: [], comments: [], totalResults: 0 });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, accessToken]);

  // Build flat list of navigable items
  const flatItems = useCallback(() => {
    if (!results) return [];
    const items = [];
    if (results.decisions?.length) {
      results.decisions.forEach((d) =>
        items.push({ type: 'decision', id: d.id, title: d.title, description: d.description, path: `/decisions/${d.id}` })
      );
    }
    if (results.communities?.length) {
      results.communities.forEach((c) =>
        items.push({ type: 'community', id: c.id, title: c.name, description: c.description, path: `/communities/${c.id}` })
      );
    }
    if (results.comments?.length) {
      results.comments.forEach((c) =>
        items.push({
          type: 'comment',
          id: c.id,
          title: c.content?.substring(0, 80) + (c.content?.length > 80 ? '...' : ''),
          description: `by ${c.author?.name || 'User'}`,
          path: c.decisionId ? `/decisions/${c.decisionId}` : '/dashboard',
        })
      );
    }
    return items;
  }, [results]);

  const items = flatItems();

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[activeIndex]) {
        navigate(items[activeIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const TYPE_ICONS = {
    decision: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    community: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    comment: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  };

  const TYPE_LABELS = {
    decision: 'Decisions',
    community: 'Communities',
    comment: 'Comments',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="fixed left-1/2 top-[15%] z-[61] w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-border-default px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search decisions, communities, comments..."
                  className="flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
                  autoComplete="off"
                />
                {loading && (
                  <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                <kbd className="hidden sm:inline-flex h-5 items-center rounded-md border border-border-default bg-surface-alt px-1.5 text-[10px] font-semibold text-text-secondary">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {!query.trim() && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-text-secondary">
                      Start typing to search across the platform
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-3 text-xs text-text-secondary/70">
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border-default bg-surface-alt px-1 py-0.5 text-[10px] font-mono">↑</kbd>
                        <kbd className="rounded border border-border-default bg-surface-alt px-1 py-0.5 text-[10px] font-mono">↓</kbd>
                        Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border-default bg-surface-alt px-1 py-0.5 text-[10px] font-mono">↵</kbd>
                        Open
                      </span>
                    </div>
                  </div>
                )}

                {query.trim() && results && items.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt text-2xl">
                      🔍
                    </div>
                    <p className="mt-2 text-sm font-semibold text-text-primary">No results found</p>
                    <p className="text-xs text-text-secondary">Try a different search term</p>
                  </div>
                )}

                {items.length > 0 && (() => {
                  let currentType = null;
                  let globalIdx = -1;

                  return items.map((item) => {
                    globalIdx++;
                    const showHeader = item.type !== currentType;
                    currentType = item.type;
                    const isActive = globalIdx === activeIndex;
                    const idx = globalIdx;

                    return (
                      <React.Fragment key={`${item.type}-${item.id}`}>
                        {showHeader && (
                          <div className="px-4 pt-3 pb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                              {TYPE_LABELS[item.type]}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            navigate(item.path);
                            onClose();
                          }}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                            isActive
                              ? 'bg-primary-soft text-primary'
                              : 'text-text-primary hover:bg-surface-alt'
                          }`}
                        >
                          <span className={`shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                            {TYPE_ICONS[item.type]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{item.title}</p>
                            {item.description && (
                              <p className="truncate text-xs text-text-secondary">{item.description}</p>
                            )}
                          </div>
                          {isActive && (
                            <kbd className="shrink-0 rounded border border-border-default bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                              ↵
                            </kbd>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              {results && items.length > 0 && (
                <div className="border-t border-border-default px-4 py-2 text-[11px] text-text-secondary">
                  {results.totalResults || items.length} result{(results.totalResults || items.length) !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
