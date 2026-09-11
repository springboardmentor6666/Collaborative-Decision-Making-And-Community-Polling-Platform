import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketTopic } from '@/hooks/useWebSocketTopic';
import { NotificationResponse } from '../types/notification';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/**
 * Hook that listens to user-specific private WebSocket queue for real-time notifications.
 * Automatically displays interactive toast alerts and updates unread badge counter.
 */
export function useLiveNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useWebSocketTopic<NotificationResponse>(
    user ? '/user/queue/notifications' : null,
    (notification) => {
      if (!notification) return;

      // 1. Increment unread notifications count in cache
      queryClient.setQueryData<number>(
        ['unreadNotificationsCount'],
        (oldCount = 0) => oldCount + 1
      );

      // 2. Invalidate notifications query to load into dropdown / page
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // 3. Show instant toast alert
      toast.info(notification.title || 'New Notification', {
        description: notification.message,
        duration: 5000,
      });
    }
  );
}
