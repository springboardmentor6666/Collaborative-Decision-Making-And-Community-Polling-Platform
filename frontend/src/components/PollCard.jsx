import React from 'react';
import VoteButton from './VoteButton';

/**
 * PollCard — Supports SINGLE_CHOICE, MULTIPLE, and RATING poll types with theme awareness.
 */
const PollCard = ({
  poll,
  decisionId,
  selectedOptionId, // for SINGLE_CHOICE
  selectedOptionIds = [], // for MULTIPLE
  ratings = {}, // { [optionId]: score } for RATING
  ratingSummary = null, // from /api/votes/rating-summary/{pollId}
  onSelectOption,
  onToggleOption,
  onRateOption,
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
  const isSingle = !isMulti && !isRating;

  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) || 0;

  const canSubmit = isSingle
    ? !!selectedOptionId
    : isMulti
    ? selectedOptionIds.length > 0
    : Object.keys(ratings).length > 0;

  return (
    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-6">
      {/* Poll header */}
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {isRating ? '⭐ Rating Scale' : isMulti ? '☑️ Multiple Choice' : '🔘 Single Choice'}
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
            : 'Select one option to cast your vote.'}
          {totalVotes > 0 && ` • ${totalVotes} vote${totalVotes !== 1 ? 's' : ''} cast`}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {poll.options?.map((option) => {
          const isSelectedSingle = selectedOptionId === option.id;
          const isSelectedMulti = selectedOptionIds.includes(option.id);
          const currentRating = ratings[option.id] || 0;
          const percentage = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;

          // Rating summary info if available
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

                  {/* Star rating selector */}
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
            <div
              key={option.id}
              onClick={() => {
                if (hasVoted) return;
                if (isMulti) {
                  onToggleOption && onToggleOption(option.id);
                } else {
                  onSelectOption && onSelectOption(option.id);
                }
              }}
              className={`relative overflow-hidden rounded-2xl border p-4 transition ${
                !hasVoted ? 'cursor-pointer' : 'cursor-default'
              } ${
                isSelected
                  ? 'border-primary bg-primary-soft'
                  : 'border-border-default bg-surface hover:border-primary-soft hover:bg-surface-alt'
              }`}
              style={isSelected ? { boxShadow: '0 0 0 2px var(--primary-soft)' } : {}}
            >
              {/* Progress bar fill when voted */}
              {hasVoted && (
                <div
                  className="absolute left-0 top-0 bottom-0 transition-all duration-700 opacity-20"
                  style={{ width: `${percentage}%`, backgroundColor: 'var(--primary)' }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Radio or Checkbox icon */}
                  {isMulti ? (
                    <span
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
                    </span>
                  ) : (
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border-default bg-surface'
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
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
            </div>
          );
        })}
      </div>

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

export default PollCard;
