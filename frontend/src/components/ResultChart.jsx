import React from 'react';
import PieChart from './PieChart';

/**
 * ResultChart — displays interactive pie chart and breakdown for live poll results.
 */
const ResultChart = ({ results }) => {
  if (!results) return null;

  const { decisionTitle, pollQuestion, totalVotes = 0, winningOption, winningVoteCount = 0, options = [] } = results;

  // Filter out any blank or undefined options to avoid rendering empty lines
  const validOptions = (options || []).filter(
    (opt) => opt && typeof opt.optionText === 'string' && opt.optionText.trim().length > 0
  );

  return (
    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Live Poll Results
          </p>
          <h2 className="text-lg font-black tracking-tight text-text-primary">
            {pollQuestion || decisionTitle}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-surface-alt px-3 py-1 text-xs font-bold text-muted">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Leading Winner banner */}
      {winningVoteCount > 0 && winningOption && (
        <div
          className="flex items-center gap-4 rounded-2xl border p-4"
          style={{
            borderColor: 'var(--winner-border)',
            backgroundColor: 'var(--winner-bg)',
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: 'var(--winner-bg)', color: 'var(--winner-accent)' }}
          >
            🏆
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--winner-accent)' }}>
              Leading Option
            </p>
            <p className="text-sm font-bold text-text-primary">{winningOption}</p>
            <p className="text-xs text-muted">
              {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''} —{' '}
              {totalVotes > 0 ? Math.round((winningVoteCount / totalVotes) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Pie Chart & Legend */}
      <div className="pt-2">
        <PieChart
          options={validOptions}
          totalVotes={totalVotes}
          winningOption={winningOption}
          size={190}
          showLegend={true}
        />
      </div>
    </div>
  );
};

export default ResultChart;

