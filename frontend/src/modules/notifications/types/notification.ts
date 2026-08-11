export type NotificationType = 'VOTE' | 'COMMENT' | 'SYSTEM' | 'INVITE' | 'DECISION_CLOSED';

export interface NotificationResponse {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
