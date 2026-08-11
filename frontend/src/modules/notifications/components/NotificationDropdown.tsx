import React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { NotificationCard } from './NotificationCard';
import { NotificationListSkeleton } from './NotificationSkeleton';
import { useNavigate } from 'react-router-dom';
import { NotificationResponse } from '../types/notification';

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isLoading } = useNotifications(5); // fetch only 5 for dropdown
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.pages[0]?.content || [];

  const handleNotificationClick = (n: NotificationResponse) => {
    // In the future, this would do deep linking.
    // For now, just navigate to the related area based on type as fallback
    if (n.type === 'COMMENT' || n.type === 'VOTE' || n.type === 'DECISION_CLOSED') {
      navigate('/decisions');
    } else if (n.type === 'INVITE') {
      navigate('/communities');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <NotificationListSkeleton count={3} />
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No new notifications
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notification => (
                <NotificationCard 
                  key={notification.notificationId} 
                  notification={notification}
                  compact={true}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
