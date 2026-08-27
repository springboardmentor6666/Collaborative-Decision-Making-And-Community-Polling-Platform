import React from 'react';
import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 8) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  if (score >= 6) return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  if (score >= 4) return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
}

export default function ComparisonMatrix({ factors = [], optionScores = [], options = [] }) {
  if (!factors || factors.length === 0) return null;

  // Build matrix lookup: { [optionLabel]: { [factorName]: score } }
  const optionMap = new Map();

  options.forEach((opt) => {
    const label = opt.label || opt.optionText || opt.name;
    if (label) {
      optionMap.set(label, {
        id: opt.id,
        label,
        description: opt.description || '',
        pros: Array.isArray(opt.pros) ? opt.pros : opt.pros ? [opt.pros] : [],
        cons: Array.isArray(opt.cons) ? opt.cons : opt.cons ? [opt.cons] : [],
        scores: {},
      });
    }
  });

  optionScores.forEach((os) => {
    const label = os.optionLabel || `Option ${os.optionId}`;
    if (!optionMap.has(label)) {
      optionMap.set(label, {
        id: os.optionId,
        label,
        description: '',
        pros: [],
        cons: [],
        scores: {},
      });
    }
    const optObj = optionMap.get(label);
    optObj.scores[os.factorName || os.factorId] = os.score;
  });

  const matrixRows = Array.from(optionMap.values()).map((item) => {
    let sum = 0;
    let count = 0;
    factors.forEach((f) => {
      const s = item.scores[f.name] ?? item.scores[f.id];
      if (typeof s === 'number') {
        sum += s;
        count++;
      }
    });
    const avg = count > 0 ? (sum / count).toFixed(1) : 0;
    return {
      id: item.id,
      label: item.label,
      description: item.description,
      pros: item.pros,
      cons: item.cons,
      scores: item.scores,
      total: sum,
      average: parseFloat(avg),
    };
  });

  // Sort by average descending
  matrixRows.sort((a, b) => b.average - a.average);

  return (
    <div className="card-glass rounded-[2rem] border border-border-default p-5 sm:p-6 shadow-sm overflow-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              Multi-Criteria Comparison Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Objective evaluation across {factors.length} weighted decision factors
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary self-start sm:self-auto">
          MCDA Evaluated
        </span>
      </div>

      {/* Numerical Matrix Table */}
      <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
        <table className="w-full min-w-[500px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border-default text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-3 px-3">Option</th>
              {factors.map((f) => (
                <th key={f.id || f.name} className="py-3 px-3 text-center">
                  <span className="inline-block rounded-md bg-muted/60 px-2 py-0.5 text-foreground">
                    {f.name}
                  </span>
                </th>
              ))}
              <th className="py-3 px-3 text-center">Avg Score</th>
              <th className="py-3 px-3 text-right">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {matrixRows.map((row, idx) => {
              const isWinner = idx === 0 && row.average > 0;
              return (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group transition-colors ${
                    isWinner ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="py-3.5 px-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      {isWinner && <span className="text-sm">👑</span>}
                      <span>{row.label}</span>
                    </div>
                  </td>

                  {factors.map((f) => {
                    const scoreVal = row.scores[f.name] ?? row.scores[f.id] ?? '-';
                    return (
                      <td key={f.id || f.name} className="py-3.5 px-3 text-center">
                        {typeof scoreVal === 'number' ? (
                          <span
                            className={`inline-flex items-center justify-center h-6 min-w-[28px] px-1.5 rounded-md text-xs font-bold border ${getScoreColor(
                              scoreVal
                            )}`}
                          >
                            {scoreVal}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3.5 px-3 text-center font-bold">
                    <span className="text-foreground text-sm">
                      {row.average > 0 ? `${row.average}/10` : '-'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    {isWinner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Top Fit
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{idx + 1}
                      </span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Structured Pros & Cons Breakdown */}
      <div className="border-t border-border-default pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black uppercase tracking-wider text-text-primary">
            Structured Pros & Cons Analysis
          </h4>
          <span className="text-[11px] text-muted">Qualitative Option Comparison</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {matrixRows.map((row, idx) => {
            const hasPros = row.pros && row.pros.length > 0;
            const hasCons = row.cons && row.cons.length > 0;

            return (
              <div
                key={row.label || idx}
                className="rounded-2xl border border-border-default bg-surface-alt/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sm text-text-primary">{row.label}</span>
                  </div>
                  {row.average > 0 && (
                    <span className="text-xs font-bold text-muted">
                      Avg Score: {row.average}/10
                    </span>
                  )}
                </div>

                {row.description && (
                  <p className="text-xs text-secondary leading-relaxed">{row.description}</p>
                )}

                {/* 2-Column Pros & Cons Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Pros */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <span>✓</span>
                      <span>Advantages (Pros)</span>
                    </div>
                    {hasPros ? (
                      <ul className="space-y-1 text-xs text-text-secondary">
                        {row.pros.map((pro, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-muted italic">
                        {row.average >= 7
                          ? 'Demonstrated strong positive marks across evaluation criteria.'
                          : 'No specific advantages listed.'}
                      </p>
                    )}
                  </div>

                  {/* Cons */}
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                      <span>⚠</span>
                      <span>Trade-offs (Cons)</span>
                    </div>
                    {hasCons ? (
                      <ul className="space-y-1 text-xs text-text-secondary">
                        {row.cons.map((con, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-muted italic">
                        {row.average < 6
                          ? 'Score indicates potential trade-offs in budget or feasibility.'
                          : 'No major drawbacks identified.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
