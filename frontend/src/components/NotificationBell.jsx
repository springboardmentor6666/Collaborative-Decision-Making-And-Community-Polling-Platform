/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: NotificationBell.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/NotificationBell.jsx
 *
 * Purpose:
 *   Interactive notification bell icon with unread badge counter and dropdown drawer for real-time alerts.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
} from '../services/notificationService';

export default function NotificationBell() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);

  const loadNotificationData = async () => {
    if (!accessToken) return;
    try {
      const [count, list] = await Promise.all([
        getUnreadNotificationCount(accessToken).catch(() => 0),
        getNotifications(accessToken).catch(() => []),
      ]);
      setUnreadCount(typeof count === 'number' ? count : (count?.unreadCount || 0));
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    loadNotificationData();
  }, [accessToken]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    if (!accessToken) return;
    setActionLoading('all');
    try {
      const updated = await markAllNotificationsAsRead(accessToken);
      setNotifications(updated);
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.read && accessToken) {
      markNotificationAsRead(notif.id, accessToken).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);

    // Parse target URL or navigate intelligently
    const target = notif.targetUrl;
    if (target && target !== '#' && target !== '/dashboard') {
      navigate(target);
    } else if (notif.message && notif.message.includes('/decisions/')) {
      const match = notif.message.match(/\/decisions\/\d+/);
      if (match) navigate(match[0]);
    } else if (notif.message && notif.message.includes('/communities/')) {
      const match = notif.message.match(/\/communities\/\d+/);
      if (match) navigate(match[0]);
    } else {
      navigate('/dashboard');
    }
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    if (!accessToken) return;
    setActionLoading(`del-${id}`);
    try {
      const updated = await dismissNotification(id, accessToken);
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to dismiss notification', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotificationData();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-surface/80 text-muted transition-all duration-200 hover:bg-surface-alt hover:text-text-primary shadow-xs"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border-default bg-surface p-0 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3 bg-surface-alt/40">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[11px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={actionLoading === 'all'}
                    className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    {actionLoading === 'all' ? 'Marking...' : 'Mark all read'}
                  </button>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted hover:text-text-primary transition"
                  title="Notification Preferences"
                >
                  ⚙️
                </Link>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border-default">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted">
                  <span className="text-2xl block mb-2">🔔</span>
                  No notifications yet. You are all caught up!
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`flex items-start gap-3 p-3.5 transition cursor-pointer hover:bg-surface-alt ${
                      !n.read ? 'bg-primary-soft/20 font-medium' : 'opacity-85'
                    }`}
                  >
                    {/* Category Icon */}
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-default text-xs">
                      {n.category === 'social' ? '💬' : n.category === 'decision' ? '🗳️' : '🔔'}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-text-primary truncate">{n.title}</p>
                        <span className="text-[10px] text-muted shrink-0">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(e, n.id)}
                      disabled={actionLoading === `del-${n.id}`}
                      className="text-muted hover:text-rose-600 p-1 rounded-md text-xs transition"
                      title="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-default p-2 text-center bg-surface-alt/20">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-muted hover:text-primary transition inline-flex items-center gap-1"
              >
                <span>Manage Notification Preferences</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
