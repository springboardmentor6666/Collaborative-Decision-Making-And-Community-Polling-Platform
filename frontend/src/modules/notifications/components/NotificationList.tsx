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
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border">
          <BellOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1.5">No Notifications Yet</h3>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          You're all caught up! We'll notify you when there's new activity in your communities.
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
            className="border-border bg-card hover:bg-muted text-foreground text-xs font-bold px-6 h-10 shadow-xs"
            onClick={() => fetchNextPage && fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading older notifications...
              </>
            ) : (
              'Load More Notifications'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
