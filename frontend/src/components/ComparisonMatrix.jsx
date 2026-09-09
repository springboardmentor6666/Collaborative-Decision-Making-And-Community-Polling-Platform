/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ComparisonMatrix.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/ComparisonMatrix.jsx
 *
 * Purpose:
 *   Multi-Criteria Decision Analysis (MCDA) matrix rendering options against weighted criteria factors with visual score comparisons.
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 8) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  if (score >= 6) return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  if (score >= 4) return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
}

const RADAR_COLORS = [
  { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.15)' },
  { stroke: '#10b981', fill: 'rgba(16,185,129,0.15)' },
  { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.15)' },
  { stroke: '#ef4444', fill: 'rgba(239,68,68,0.15)' },
  { stroke: '#8b5cf6', fill: 'rgba(139,92,246,0.15)' },
];

/**
 * RadarChart — Inline SVG spider/radar chart comparing option factor profiles.
 */
function RadarChart({ factors, matrixRows, maxScore = 10 }) {
  const topOptions = matrixRows.slice(0, 4);
  if (factors.length < 3 || topOptions.length < 1) return null;

  const cx = 150, cy = 150, radius = 110;
  const n = factors.length;
  const angleStep = (2 * Math.PI) / n;

  // Generate polygon points for concentric grid
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getPoint = (factorIdx, value) => {
    const angle = factorIdx * angleStep - Math.PI / 2;
    const r = (value / maxScore) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getPolygonPoints = (scores) => {
    return factors
      .map((f, i) => {
        const score = scores[f.name] ?? scores[f.id] ?? 0;
        const pt = getPoint(i, score);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  return (
    <div className="rounded-2xl border border-border-default bg-surface-alt/30 p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
        Radar Chart Comparison
      </h4>
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px] shrink-0">
          {/* Grid circles */}
          {gridLevels.map((level, li) => (
            <polygon
              key={li}
              points={factors.map((_, i) => {
                const pt = getPoint(i, maxScore * level);
                return `${pt.x},${pt.y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.5"
              opacity="0.6"
            />
          ))}

          {/* Axis lines */}
          {factors.map((_, i) => {
            const pt = getPoint(i, maxScore);
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={pt.x} y2={pt.y}
                stroke="var(--border)"
                strokeWidth="0.5"
                opacity="0.6"
              />
            );
          })}

          {/* Data polygons */}
          {topOptions.map((row, rowIdx) => (
            <polygon
              key={row.label}
              points={getPolygonPoints(row.scores)}
              fill={RADAR_COLORS[rowIdx % RADAR_COLORS.length].fill}
              stroke={RADAR_COLORS[rowIdx % RADAR_COLORS.length].stroke}
              strokeWidth="2"
              opacity="0.85"
            />
          ))}

          {/* Data dots */}
          {topOptions.map((row, rowIdx) =>
            factors.map((f, fi) => {
              const score = row.scores[f.name] ?? row.scores[f.id] ?? 0;
              const pt = getPoint(fi, score);
              return (
                <circle
                  key={`${row.label}-${fi}`}
                  cx={pt.x} cy={pt.y}
                  r="3"
                  fill={RADAR_COLORS[rowIdx % RADAR_COLORS.length].stroke}
                />
              );
            })
          )}

          {/* Axis labels */}
          {factors.map((f, i) => {
            const pt = getPoint(i, maxScore + 1.8);
            return (
              <text
                key={i}
                x={pt.x} y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-semibold fill-current"
                style={{ fill: 'var(--text-secondary)' }}
              >
                {f.name?.length > 8 ? f.name.slice(0, 8) + '…' : f.name}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap lg:flex-col gap-2">
          {topOptions.map((row, idx) => (
            <div key={row.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full border-2"
                style={{
                  backgroundColor: RADAR_COLORS[idx % RADAR_COLORS.length].fill,
                  borderColor: RADAR_COLORS[idx % RADAR_COLORS.length].stroke,
                }}
              />
              <span className="text-xs font-semibold text-text-primary">{row.label}</span>
              <span className="text-[10px] text-text-secondary">({row.weightedAvg?.toFixed(1) || row.average}/10)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparisonMatrix({ factors = [], optionScores = [], options = [] }) {
  if (!factors || factors.length === 0) return null;

  // Factor weight state — equal distribution initially
  const [weights, setWeights] = useState(() => {
    const w = {};
    const equal = Math.round(100 / factors.length);
    factors.forEach((f, i) => {
      w[f.name || f.id] = i === factors.length - 1 ? 100 - equal * (factors.length - 1) : equal;
    });
    return w;
  });

  const [showRadar, setShowRadar] = useState(true);

  // Handle weight slider change with auto-normalization
  const handleWeightChange = (factorKey, newValue) => {
    setWeights((prev) => {
      const updated = { ...prev, [factorKey]: newValue };
      const totalOthers = Object.entries(updated)
        .filter(([k]) => k !== factorKey)
        .reduce((s, [, v]) => s + v, 0);
      const remaining = 100 - newValue;

      if (totalOthers > 0) {
        const ratio = remaining / totalOthers;
        Object.keys(updated).forEach((k) => {
          if (k !== factorKey) {
            updated[k] = Math.max(0, Math.round(updated[k] * ratio));
          }
        });
      }

      // Fix rounding
      const sum = Object.values(updated).reduce((s, v) => s + v, 0);
      if (sum !== 100) {
        const diff = 100 - sum;
        const otherKey = Object.keys(updated).find((k) => k !== factorKey);
        if (otherKey) updated[otherKey] += diff;
      }

      return updated;
    });
  };

  // Build matrix lookup
  const optionMap = new Map();
  options.forEach((opt) => {
    const label = opt.label || opt.optionText || opt.name;
    if (label) {
      optionMap.set(label, {
        id: opt.id, label,
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
      optionMap.set(label, { id: os.optionId, label, description: '', pros: [], cons: [], scores: {} });
    }
    const optObj = optionMap.get(label);
    optObj.scores[os.factorName || os.factorId] = os.score;
  });

  const matrixRows = useMemo(() => {
    return Array.from(optionMap.values()).map((item) => {
      let weightedSum = 0;
      let totalWeight = 0;
      let sum = 0;
      let count = 0;

      factors.forEach((f) => {
        const key = f.name || f.id;
        const s = item.scores[f.name] ?? item.scores[f.id];
        if (typeof s === 'number') {
          sum += s;
          count++;
          const w = (weights[key] || 0) / 100;
          weightedSum += s * w;
          totalWeight += w;
        }
      });

      const avg = count > 0 ? (sum / count).toFixed(1) : 0;
      const weightedAvg = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : 0;

      return {
        id: item.id, label: item.label, description: item.description,
        pros: item.pros, cons: item.cons, scores: item.scores,
        total: sum, average: parseFloat(avg),
        weightedAvg: parseFloat(weightedAvg),
      };
    }).sort((a, b) => b.weightedAvg - a.weightedAvg);
  }, [factors, options, optionScores, weights]);

  return (
    <div className="card-glass rounded-[2rem] border border-border-default p-5 sm:p-6 shadow-sm overflow-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRadar(!showRadar)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              showRadar
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-border-default bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            {showRadar ? '📊 Radar Chart' : '📊 Show Radar'}
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            MCDA Evaluated
          </span>
        </div>
      </div>

      {/* ═══════════ FACTOR WEIGHT SLIDERS ═══════════ */}
      <div className="space-y-3 rounded-2xl border border-border-default bg-surface-alt/30 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Factor Weights
          </h4>
          <button
            type="button"
            onClick={() => {
              const equal = Math.round(100 / factors.length);
              const w = {};
              factors.forEach((f, i) => {
                const key = f.name || f.id;
                w[key] = i === factors.length - 1 ? 100 - equal * (factors.length - 1) : equal;
              });
              setWeights(w);
            }}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Reset Equal
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {factors.map((f) => {
            const key = f.name || f.id;
            const w = weights[key] || 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-20 truncate text-xs font-semibold text-text-primary" title={f.name}>
                  {f.name}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={w}
                  onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-border-default cursor-pointer accent-primary"
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span className="w-10 text-right text-xs font-bold text-primary">{w}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ RADAR CHART ═══════════ */}
      {showRadar && matrixRows.length > 0 && (
        <RadarChart factors={factors} matrixRows={matrixRows} />
      )}

      {/* ═══════════ NUMERICAL MATRIX TABLE ═══════════ */}
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
                  <span className="block text-[9px] text-muted mt-0.5 font-normal">
                    {weights[f.name || f.id] || 0}%
                  </span>
                </th>
              ))}
              <th className="py-3 px-3 text-center">Weighted Score</th>
              <th className="py-3 px-3 text-right">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {matrixRows.map((row, idx) => {
              const isWinner = idx === 0 && row.weightedAvg > 0;
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
                            className={`inline-flex items-center justify-center h-6 min-w-[28px] px-1.5 rounded-md text-xs font-bold border ${getScoreColor(scoreVal)}`}
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
                      {row.weightedAvg > 0 ? `${row.weightedAvg}/10` : '-'}
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
                  {row.weightedAvg > 0 && (
                    <span className="text-xs font-bold text-muted">
                      Weighted: {row.weightedAvg}/10
                    </span>
                  )}
                </div>

                {row.description && (
                  <p className="text-xs text-secondary leading-relaxed">{row.description}</p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
