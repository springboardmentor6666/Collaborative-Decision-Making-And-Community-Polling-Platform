/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: PollCard.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/PollCard.jsx
 *
 * Purpose:
 *   Interactive poll ballot and result visualizer supporting Single, Multi, Approval, Ranked-Choice, and 5-Star Rating polls.
 */

import React, { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import VoteButton from './VoteButton';

/**
 * PollCard — Supports SINGLE_CHOICE, MULTIPLE, RATING, and RANKED_CHOICE poll types.
 * Enhanced with ring indicators, selection counters, drag-and-drop ranking, and progress fills.
 */
const PollCard = ({
  poll,
  decisionId,
  selectedOptionId,
  selectedOptionIds = [],
  ratings = {},
  ratingSummary = null,
  rankedOptions: rankedOptionsProp,
  onSelectOption,
  onToggleOption,
  onRateOption,
  onReorder,
  onVote,
  isSubmitting,
  hasVoted,
}) => {
  if (!poll) {
    return (
      <div className="rounded-2xl border border-dashed border-border-default p-8 text-center text-muted">
        No active poll linked to this decision.
      </div>
    );
  }

  const pollType = (poll.pollType || 'SINGLE_CHOICE').toUpperCase();
  const isMulti = pollType === 'MULTIPLE' || pollType === 'MULTI';
  const isRating = pollType === 'RATING';
  const isRanked = pollType === 'RANKED_CHOICE' || pollType === 'RANKED';
  const isSingle = !isMulti && !isRating && !isRanked;

  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) || 0;

  const canSubmit = isSingle
    ? !!selectedOptionId
    : isMulti
    ? selectedOptionIds.length > 0
    : isRanked
    ? (rankedOptionsProp || poll.options || []).length > 0
    : Object.keys(ratings).length > 0;

  // For multi-choice selection counter
  const maxSelections = poll.maxSelections || poll.options?.length || 0;

  return (
    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-6">
      {/* Poll header */}
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {isRating ? '⭐ Rating Scale' : isMulti ? '☑️ Multiple Choice' : isRanked ? '🔀 Ranked Choice' : '🔘 Single Choice'}
          </span>
          {poll.isAnonymous && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              🕵️ Anonymous Poll
            </span>
          )}
        </div>
        <h3 className="text-xl font-black tracking-tight text-text-primary break-words [overflow-wrap:anywhere]">
          {poll.question}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {isRating
            ? 'Rate each option on a scale of 1 to 5 stars.'
            : isMulti
            ? 'Select one or more options that you support.'
            : isRanked
            ? 'Drag to rank options in your preferred order.'
            : 'Select one option to cast your vote.'}
          {totalVotes > 0 && ` • ${totalVotes} vote${totalVotes !== 1 ? 's' : ''} cast`}
        </p>
      </div>

      {/* Multi-choice selection counter */}
      {isMulti && !hasVoted && (
        <div className="flex items-center justify-between rounded-xl bg-primary-soft/50 px-4 py-2">
          <span className="text-xs font-bold text-primary">
            Selected: {selectedOptionIds.length} of {maxSelections}
          </span>
          <div className="flex gap-1">
            {poll.options?.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
                  i < selectedOptionIds.length ? 'bg-primary' : 'bg-border-default'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ RANKED CHOICE ═══════════ */}
      {isRanked && !hasVoted && (
        <RankedChoiceOptions
          options={rankedOptionsProp || poll.options || []}
          onReorder={onReorder}
        />
      )}

      {/* ═══════════ OPTIONS LIST (non-ranked) ═══════════ */}
      {!isRanked && (
        <div className="space-y-3">
          {poll.options?.map((option) => {
            const isSelectedSingle = selectedOptionId === option.id;
            const isSelectedMulti = selectedOptionIds.includes(option.id);
            const currentRating = ratings[option.id] || 0;
            const percentage = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;

            const optionRatingInfo = ratingSummary?.optionRatings?.find(
              (r) => Number(r.optionId) === Number(option.id)
            );

            if (isRating) {
              return (
                <div
                  key={option.id}
                  className="rounded-2xl border border-border-default bg-surface-alt/50 p-4 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-primary break-words [overflow-wrap:anywhere]">
                        {option.optionText}
                      </p>
                      {option.description && (
                        <p className="text-xs text-muted mt-0.5">{option.description}</p>
                      )}
                      {optionRatingInfo && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                          <span>★ {optionRatingInfo.averageRating?.toFixed(1) || '0.0'} / 5.0</span>
                          <span className="text-[11px] text-muted">({optionRatingInfo.totalVotes || 0} reviews)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={hasVoted}
                          onClick={() => onRateOption && onRateOption(option.id, star)}
                          className={`p-1.5 transition-transform hover:scale-110 disabled:cursor-default ${
                            currentRating >= star
                              ? 'text-amber-400'
                              : 'text-border-default hover:text-amber-300'
                          }`}
                          title={`${star} Star${star !== 1 ? 's' : ''}`}
                        >
                          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-1 min-w-[24px] text-center text-xs font-bold text-text-primary">
                        {currentRating > 0 ? `${currentRating}★` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Single Choice or Multiple Choice
            const isSelected = isMulti ? isSelectedMulti : isSelectedSingle;

            return (
              <motion.div
                key={option.id}
                whileTap={!hasVoted ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (hasVoted) return;
                  if (isMulti) {
                    onToggleOption && onToggleOption(option.id);
                  } else {
                    onSelectOption && onSelectOption(option.id);
                  }
                }}
                className={`relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200 ${
                  !hasVoted ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isSelected
                    ? 'border-primary bg-primary-soft ring-2 ring-primary/20'
                    : 'border-border-default bg-surface hover:border-primary/40 hover:bg-surface-alt'
                }`}
              >
                {/* Progress bar fill when voted */}
                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute left-0 top-0 bottom-0 opacity-15"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}

                <div className="relative flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Radio or Checkbox icon */}
                    {isMulti ? (
                      <motion.span
                        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border-default bg-surface'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </motion.span>
                    ) : (
                      <motion.span
                        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-border-default bg-surface'
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-white"
                          />
                        )}
                      </motion.span>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-text-primary break-words [overflow-wrap:anywhere]">
                        {option.optionText}
                      </span>
                      {option.description && (
                        <p className="text-xs text-muted mt-0.5">{option.description}</p>
                      )}
                    </div>
                  </div>

                  {hasVoted && (
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-text-primary">{percentage}%</span>
                      <span className="block text-xs text-muted">
                        {option.voteCount || 0} vote{option.voteCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ranked choice results after voting */}
      {isRanked && hasVoted && (
        <div className="space-y-2">
          {(rankedOptionsProp || poll.options || []).map((option, idx) => (
            <div
              key={option.id}
              className="flex items-center gap-3 rounded-2xl border border-border-default bg-surface-alt/50 p-4"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                idx === 0 ? 'bg-amber-500/20 text-amber-600' : 'bg-surface-alt text-text-secondary'
              }`}>
                #{idx + 1}
              </span>
              <span className="text-sm font-semibold text-text-primary">{option.optionText}</span>
            </div>
          ))}
        </div>
      )}

      {!hasVoted && (
        <VoteButton
          onClick={onVote}
          disabled={!canSubmit || isSubmitting}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

/**
 * RankedChoiceOptions — Drag-and-drop ranking using Framer Motion Reorder.
 */
function RankedChoiceOptions({ options, onReorder }) {
  // Initialize local order from prop
  const [items, setItems] = useState(() =>
    options.map((opt, idx) => ({ ...opt, rank: idx + 1 }))
  );

  const handleReorder = (newItems) => {
    const updated = newItems.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setItems(updated);
    if (onReorder) onReorder(updated);
  };

  const moveItem = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    handleReorder(newItems);
  };

  return (
    <div className="space-y-2">
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((item, idx) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-center gap-3 rounded-2xl border-2 border-border-default bg-surface p-4 cursor-grab active:cursor-grabbing shadow-sm hover:border-primary/40 transition-colors"
            whileDrag={{
              scale: 1.02,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              borderColor: 'var(--primary)',
            }}
          >
            {/* Drag Handle */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-text-secondary cursor-grab">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
            </span>

            {/* Rank Badge */}
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
              idx === 0
                ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                : idx === 1
                ? 'bg-slate-300/20 text-slate-600 border border-slate-300/30'
                : idx === 2
                ? 'bg-orange-400/20 text-orange-600 border border-orange-400/30'
                : 'bg-surface-alt text-text-secondary border border-border-default'
            }`}>
              #{idx + 1}
            </span>

            {/* Option Text */}
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-text-primary break-words">
                {item.optionText}
              </span>
              {item.description && (
                <p className="text-xs text-muted mt-0.5">{item.description}</p>
              )}
            </div>

            {/* Up/Down Arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(idx, -1); }}
                disabled={idx === 0}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-alt transition disabled:opacity-30"
                title="Move up"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(idx, 1); }}
                disabled={idx === items.length - 1}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-alt transition disabled:opacity-30"
                title="Move down"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

export default PollCard;
