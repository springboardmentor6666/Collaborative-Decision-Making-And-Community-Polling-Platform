/**
 * Notification Service — manages notifications by calling real Backend Eng 2 endpoints (/api/notifications).
 * Completely connected to Spring Boot backend API with full type support:
 * - VOTING_REMINDER / VOTE_UPDATE
 * - NEW_COMMENT
 * - POLL_COMPLETED / DECISION_RESOLVED
 * - COMMUNITY_INVITE
 * - DECISION_UPDATE
 * - SYSTEM / ANALYTICS_DIGEST
 */

import {
  getNotificationsApi,
  getUnreadNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
} from '../api/axiosClient';

function getBadgeForType(type) {
  switch (type) {
    case 'VOTE_UPDATE':
    case 'VOTING_REMINDER':
      return 'Votes';
    case 'DECISION_RESOLVED':
    case 'POLL_COMPLETED':
      return 'Resolved';
    case 'COMMUNITY_INVITE':
      return 'Invite';
    case 'NEW_COMMENT':
      return 'Comment';
    case 'DECISION_UPDATE':
      return 'Update';
    case 'ANALYTICS_DIGEST':
    case 'SYSTEM':
    default:
      return 'System';
  }
}

function getCategoryForType(type) {
  switch (type) {
    case 'VOTE_UPDATE':
    case 'VOTING_REMINDER':
    case 'DECISION_RESOLVED':
    case 'POLL_COMPLETED':
    case 'DECISION_UPDATE':
      return 'decision';
    case 'COMMUNITY_INVITE':
    case 'NEW_COMMENT':
      return 'social';
    case 'ANALYTICS_DIGEST':
    case 'SYSTEM':
    default:
      return 'system';
  }
}

function getTitleForType(type) {
  switch (type) {
    case 'VOTE_UPDATE':
      return 'New votes on your decision';
    case 'VOTING_REMINDER':
      return 'Voting reminder';
    case 'DECISION_RESOLVED':
    case 'POLL_COMPLETED':
      return 'Decision poll concluded';
    case 'COMMUNITY_INVITE':
      return 'Community invitation';
    case 'NEW_COMMENT':
      return 'New discussion comment';
    case 'DECISION_UPDATE':
      return 'Decision updated';
    case 'ANALYTICS_DIGEST':
      return 'Analytics update';
    case 'SYSTEM':
    default:
      return 'Notification';
  }
}

function formatNotificationItem(item) {
  if (!item) return null;
  const isRead = item.isRead !== undefined ? item.isRead : Boolean(item.read);
  const type = item.type || 'SYSTEM';

  return {
    id: item.id,
    userId: item.userId,
    category: item.category || getCategoryForType(type),
    type: type,
    title: item.title || getTitleForType(type),
    message: item.message || '',
    targetUrl: item.targetUrl || (item.message?.includes('/decisions/') ? item.message.match(/\/decisions\/\d+/)?.[0] : null) || '/dashboard',
    read: isRead,
    createdAt: item.createdAt || new Date().toISOString(),
    badge: item.badge || getBadgeForType(type),
  };
}

/**
 * Fetch all notifications for current user from backend
 */
export async function getNotifications(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  const list = await getNotificationsApi(authToken);
  return (list || []).map(formatNotificationItem).filter(Boolean);
}

/**
 * Fetch unread notifications
 */
export async function getUnreadNotifications(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  const list = await getUnreadNotificationsApi(authToken);
  return (list || []).map(formatNotificationItem).filter(Boolean);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return 0;
  return await getUnreadNotificationCountApi(authToken);
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id, token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  await markNotificationAsReadApi(id, authToken);
  return await getNotifications(authToken);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  await markAllNotificationsAsReadApi(authToken);
  return await getNotifications(authToken);
}

/**
 * Dismiss / delete a single notification
 */
export async function dismissNotification(id, token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  await deleteNotificationApi(id, authToken);
  return await getNotifications(authToken);
}

/**
 * Clear all notifications by marking read / dismissing
 */
export async function clearAllNotifications(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);
  if (!authToken) return [];
  await markAllNotificationsAsReadApi(authToken);
  return [];
}

