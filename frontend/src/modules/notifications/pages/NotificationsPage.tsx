import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { NotificationList } from '../components/NotificationList';
import { NotificationListSkeleton } from '../components/NotificationSkeleton';
import { NotificationType } from '../types/notification';
import { Button } from '@/components/ui/button';
import { Check, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications(20);
  const markAllAsRead = useMarkAllAsRead();
  const [filter, setFilter] = useState<NotificationType | 'ALL' | 'UNREAD'>('ALL');

  // Flatten infinite query pages
  const allNotifications = data?.pages.flatMap(page => page.content) || [];

  // Frontend filtering since backend doesn't seem to support filter params
  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.read;
    return n.type === filter;
  });

  const handleNotificationClick = (n: any) => {
    // Deep linking fallback
    if (n.type === 'COMMENT' || n.type === 'VOTE' || n.type === 'DECISION_CLOSED') {
      navigate('/decisions');
    } else if (n.type === 'INVITE') {
      navigate('/communities');
    }
  };

  const filterOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'UNREAD', label: 'Unread' },
    { value: 'COMMENT', label: 'Comments' },
    { value: 'VOTE', label: 'Votes' },
    { value: 'INVITE', label: 'Invites' },
    { value: 'SYSTEM', label: 'System' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">Stay updated with activities in your communities</p>
        </div>
        
        <Button 
          variant="outline" 
          className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending || allNotifications.every(n => n.read)}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === opt.value
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 min-h-[400px]">
        {isLoading ? (
          <NotificationListSkeleton count={5} />
        ) : (
          <NotificationList
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </div>
  );
}
