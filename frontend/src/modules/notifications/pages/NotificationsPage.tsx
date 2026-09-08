import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { NotificationList } from '../components/NotificationList';
import { NotificationListSkeleton } from '../components/NotificationSkeleton';
import { NotificationType } from '../types/notification';
import { Button } from '@/components/ui/button';
import { Check, Filter, Bell } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 sm:p-7 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Stay updated with activities across all your communities</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="border-border hover:bg-muted text-foreground text-xs font-semibold h-9"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending || allNotifications.every(n => n.read)}
        >
          <Check className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/70 text-muted-foreground border border-border/50 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === opt.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs min-h-[400px]">
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
