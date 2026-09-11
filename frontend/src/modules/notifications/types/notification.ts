export type NotificationType = 'VOTE' | 'COMMENT' | 'SYSTEM' | 'INVITE' | 'DECISION_CLOSED' | 'COMMUNITY_DECISION' | 'HIKE';

export interface NotificationResponse {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
