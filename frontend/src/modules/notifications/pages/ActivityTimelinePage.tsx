import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { format } from 'date-fns';
import { MessageSquare, ThumbsUp, Info, UserPlus, Lock, Activity, Clock } from 'lucide-react';
import { NotificationListSkeleton } from '../components/NotificationSkeleton';
import { Button } from '@/components/ui/button';

export default function ActivityTimelinePage() {
  // Using notifications as activity data
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications(30);

  const notifications = data?.pages.flatMap(page => page.content) || [];

  // Group notifications by date (e.g., "Today", "Yesterday", "August 5, 2026")
  const groupedActivity = notifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt);
    const dateKey = format(date, 'MMMM d, yyyy');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMMENT': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'VOTE': return <ThumbsUp className="w-4 h-4 text-emerald-500" />;
      case 'INVITE': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'DECISION_CLOSED': return <Lock className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'COMMENT': return 'bg-blue-500/10 border-blue-500/20';
      case 'VOTE': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'INVITE': return 'bg-purple-500/10 border-purple-500/20';
      case 'DECISION_CLOSED': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Activity className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Timeline</h1>
          <p className="text-slate-400 mt-1">A chronological history of events in your network</p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 md:p-8 rounded-xl border border-slate-800/50 min-h-[400px]">
        {isLoading ? (
          <NotificationListSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Activity Found</h3>
            <p className="text-slate-400 text-sm">Your timeline is empty. Engage with communities to see activity here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivity).map(([dateLabel, items]) => (
              <div key={dateLabel} className="relative">
                <h3 className="sticky top-20 z-10 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 shadow-sm mb-6">
                  {dateLabel}
                </h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:via-slate-700 before:to-transparent">
                  {items.map((item) => (
                    <div key={item.notificationId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon point */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${getIconBg(item.type)} z-10`}>
                        {getIcon(item.type)}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400">
                            {format(new Date(item.createdAt), 'h:mm a')}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="pt-8 flex justify-center">
                <Button 
                  variant="outline" 
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading older activity...' : 'Load More Activity'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
