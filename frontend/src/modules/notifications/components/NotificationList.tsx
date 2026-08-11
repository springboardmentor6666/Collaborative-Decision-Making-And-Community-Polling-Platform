import React from 'react';
import { NotificationCard } from './NotificationCard';
import { NotificationResponse } from '../types/notification';
import { BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationListProps {
  notifications: NotificationResponse[];
  onNotificationClick: (n: NotificationResponse) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  compact?: boolean;
}

export function NotificationList({ 
  notifications, 
  onNotificationClick, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage,
  compact = false
}: NotificationListProps) {
  
  if (notifications.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-12' : 'py-24'}`}>
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Notifications Yet</h3>
        <p className="text-slate-400 text-sm max-w-[250px]">
          You're all caught up! We'll notify you when there's new activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.notificationId}
          notification={notification}
          compact={compact}
          onClick={() => onNotificationClick(notification)}
        />
      ))}

      {hasNextPage && (
        <div className="pt-4 flex justify-center">
          <Button 
            variant="outline" 
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 w-full md:w-auto"
            onClick={() => fetchNextPage && fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading older notifications...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
