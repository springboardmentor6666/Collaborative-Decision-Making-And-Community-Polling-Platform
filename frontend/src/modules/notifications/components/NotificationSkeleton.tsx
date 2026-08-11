import React from 'react';

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0"></div>
      <div className="flex-1 space-y-3 pt-1 pr-6">
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
        <div className="h-3 bg-slate-800 rounded w-24 mt-4"></div>
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}
