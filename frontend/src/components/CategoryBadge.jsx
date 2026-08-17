import React from 'react';

const CATEGORY_STYLES = {
  'Technology & Engineering': {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    icon: '⚡',
  },
  'Governance & Policy': {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    icon: '🏛️',
  },
  'Product & Design': {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
    icon: '🎨',
  },
  'Finance & Budget': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    icon: '💰',
  },
  'Operations & Strategy': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    icon: '🎯',
  },
  'Community & Culture': {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    icon: '👥',
  },
  'Other': {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
    icon: '🏷️',
  },
};

export default function CategoryBadge({ name, size = 'sm', className = '' }) {
  if (!name) return null;

  const matchedStyle = CATEGORY_STYLES[name] || {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    icon: '✨',
  };

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px] gap-1' 
    : size === 'md'
    ? 'px-3 py-1.5 text-xs font-semibold gap-1.5'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shadow-xs transition-all ${matchedStyle.bg} ${sizeClasses} ${className}`}
    >
      <span className="text-[1.1em] leading-none">{matchedStyle.icon}</span>
      <span className="truncate max-w-[140px] sm:max-w-none">{name}</span>
    </span>
  );
}
