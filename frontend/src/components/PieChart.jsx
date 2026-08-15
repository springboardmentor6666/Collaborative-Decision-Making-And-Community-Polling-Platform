import { motion } from 'framer-motion';
import { useMemo } from 'react';

const SLICE_COLORS = [
  '#2563eb', // Royal Blue
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export default function PieChart({
  options = [],
  totalVotes = 0,
  winningOption = null,
  size = 180,
  showLegend = true,
  userChoiceId = null,
}) {
  // Filter out any blank, empty, or undefined options
  const validOptions = useMemo(() => {
    return (options || []).filter(
      (opt) => opt && typeof opt.optionText === 'string' && opt.optionText.trim().length > 0
    );
  }, [options]);

  const radius = 68;
  const strokeWidth = 28;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative slice offsets
  const slices = useMemo(() => {
    if (!validOptions.length || totalVotes <= 0) return [];

    let accumulatedPct = 0;
    return validOptions.map((opt, idx) => {
      const votes = opt.voteCount || 0;
      const pct = (votes / totalVotes) * 100;
      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPct / 100) * circumference);
      accumulatedPct += pct;

      return {
        ...opt,
        pct: Math.round(pct),
        exactPct: pct,
        color: SLICE_COLORS[idx % SLICE_COLORS.length],
        strokeDasharray,
        strokeDashoffset,
        isWinner: opt.optionText === winningOption || (opt.id && opt.id === winningOption?.id),
        isUserChoice: userChoiceId && Number(opt.id) === Number(userChoiceId),
      };
    });
  }, [validOptions, totalVotes, circumference, winningOption, userChoiceId]);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around w-full">
      {/* SVG Donut / Pie Visualization */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--surface-alt)"
            strokeWidth={strokeWidth}
          />

          {totalVotes > 0 &&
            slices.map((slice, idx) => (
              <motion.circle
                key={slice.id || idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: slice.strokeDasharray }}
                transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
              />
            ))}
        </svg>

        {/* Center Statistics Label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-text-primary">
            {totalVotes}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {totalVotes === 1 ? 'Vote' : 'Votes'}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      {showLegend && (
        <div className="w-full flex-1 space-y-2.5 min-w-0">
          {validOptions.length === 0 ? (
            <p className="text-xs text-muted text-center py-2">No option results available</p>
          ) : (
            validOptions.map((opt, idx) => {
              const slice = slices.find((s) => s.id === opt.id) || {
                pct: totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 0,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                isWinner: opt.optionText === winningOption,
                isUserChoice: userChoiceId && Number(opt.id) === Number(userChoiceId),
              };

              const voteCount = opt.voteCount || 0;

              return (
                <div
                  key={opt.id || idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface p-2.5 text-xs transition hover:bg-surface-alt min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-bold text-text-primary break-words [overflow-wrap:anywhere] min-w-0 flex-1 line-clamp-1">
                      {opt.optionText}
                    </span>
                    {slice.isUserChoice && (
                      <span className="shrink-0 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Your Choice
                      </span>
                    )}
                    {slice.isWinner && voteCount > 0 && (
                      <span className="shrink-0 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        👑 Leading
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-text-primary">{slice.pct}%</span>
                    <span className="ml-1.5 text-[11px] text-muted">
                      ({voteCount} {voteCount === 1 ? 'vote' : 'votes'})
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
