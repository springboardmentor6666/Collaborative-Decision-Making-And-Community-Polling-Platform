import React from 'react';
import { NotificationResponse } from '../types/notification';
import { MessageSquare, ThumbsUp, Info, UserPlus, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

interface NotificationCardProps {
  notification: NotificationResponse;
  onClick?: () => void;
  compact?: boolean;
}

export function NotificationCard({ notification, onClick, compact = false }: NotificationCardProps) {
  const markAsRead = useMarkAsRead();

  const getIcon = () => {
    switch (notification.type) {
      case 'COMMENT':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'VOTE':
        return <ThumbsUp className="w-5 h-5 text-emerald-500" />;
      case 'INVITE':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'DECISION_CLOSED':
        return <Lock className="w-5 h-5 text-amber-500" />;
      case 'SYSTEM':
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIconBg = () => {
    switch (notification.type) {
      case 'COMMENT': return 'bg-blue-500/10';
      case 'VOTE': return 'bg-emerald-500/10';
      case 'INVITE': return 'bg-purple-500/10';
      case 'DECISION_CLOSED': return 'bg-amber-500/10';
      case 'SYSTEM':
      default: return 'bg-muted';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.notificationId);
    }
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer border ${
        notification.read 
          ? 'bg-card border-border hover:border-border/80 hover:bg-muted/40' 
          : 'bg-card border-blue-500/40 hover:border-blue-500/60 ring-1 ring-blue-500/20 shadow-xs'
      }`}
    >
      {!notification.read && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
      )}
      
      <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${getIconBg()}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <h4 className={`text-sm font-semibold leading-snug ${notification.read ? 'text-foreground' : 'text-foreground font-bold'}`}>
          {notification.title}
        </h4>
        <p className={`text-sm mt-1 line-clamp-2 leading-relaxed ${notification.read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
          {notification.message}
        </p>
        <div className="mt-2 text-xs font-medium text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
