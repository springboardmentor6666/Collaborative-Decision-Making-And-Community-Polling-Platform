import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/useTheme';
import { useAuth } from '../context/AuthContext';
import { FONT_FAMILIES, FONT_SIZES } from '../theme/themes';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
} from '../services/notificationService';

/**
 * IconSidebar — slim control rail pinned to the right edge.
 * Hosts real notification stream, theme switching, preferences, and help.
 */

const sidebarItems = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'theme',
    label: 'Toggle Theme',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help & Info',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const itemVariants = {
  hidden: { opacity: 0, x: 15, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const UI_MODE_COLORS = {
  black: '#0f172a',
  green: '#16a34a',
  saffron: '#f59e0b',
  royal: '#2563eb',
};

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNotificationIcon(type) {
  switch (type) {
    case 'VOTE_UPDATE':
    case 'VOTING_REMINDER':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'DECISION_RESOLVED':
    case 'POLL_COMPLETED':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'COMMUNITY_INVITE':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'NEW_COMMENT':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    case 'DECISION_UPDATE':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'ANALYTICS_DIGEST':
    case 'SYSTEM':
    default:
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function IconSidebar() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const {
    theme,
    uiMode,
    fontFamily,
    fontSize,
    setTheme,
    setUiMode,
    setFontFamily,
    setFontSize,
    cycleTheme,
    resetTypography,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('settings');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'DECISIONS' | 'SOCIAL'

  const fetchLiveNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getNotifications(accessToken);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openPanel = (panelId) => {
    setActivePanel(panelId);
    setIsOpen(true);
    if (panelId === 'notifications') {
      fetchLiveNotifications();
    }
  };

  const closePanel = () => setIsOpen(false);

  const handleMarkAsRead = async (id) => {
    const updated = await markNotificationAsRead(id, accessToken);
    setNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const updated = await markAllNotificationsAsRead(accessToken);
    setNotifications(updated);
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    const updated = await dismissNotification(id, accessToken);
    setNotifications(updated);
  };

  const handleClearAll = async () => {
    const updated = await clearAllNotifications(accessToken);
    setNotifications(updated);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.targetUrl) {
      closePanel();
      navigate(notif.targetUrl);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (notifFilter === 'UNREAD') return !item.read;
    if (notifFilter === 'DECISIONS') return item.category === 'decision';
    if (notifFilter === 'SOCIAL') return item.category === 'social' || item.category === 'system';
    return true;
  });

  return (
    <>
      <aside
        className="fixed right-0 top-0 z-40 hidden h-screen w-[60px] flex-col items-center justify-center gap-3 border-l border-border-default py-4 backdrop-blur-xl sm:flex shadow-sm pointer-events-auto"
        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)' }}
      >
        {/* DecisionHub micro-logo at top */}
        <div
          className="mb-auto mt-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
              <circle cx="10" cy="24" r="4" fill="currentColor" stroke="none" />
              <circle cx="24" cy="10" r="4" fill="currentColor" stroke="none" />
              <circle cx="38" cy="24" r="4" fill="currentColor" stroke="none" />
              <circle cx="24" cy="38" r="4" fill="currentColor" stroke="none" />
              <path d="M13 21L21 13" />
              <path d="M27 13L35 21" />
              <path d="M13 27L21 35" />
              <path d="M27 35L35 27" />
            </g>
          </svg>
        </div>

        {/* Icon buttons - centered */}
        <div className="flex flex-col items-center gap-2">
          {sidebarItems.map((item) => {
            const isNotif = item.id === 'notifications';
            const hasActiveNotifs = isNotif && unreadCount > 0;

            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (item.id === 'theme') {
                    cycleTheme();
                    return;
                  }
                  openPanel(item.id);
                }}
                className={`icon-sidebar-btn ${hasActiveNotifs ? 'notif-pulse notif-dot' : ''}`}
                title={isNotif && unreadCount > 0 ? `${item.label} (${unreadCount} unread)` : item.label}
                aria-label={item.label}
              >
                {item.icon}
                {hasActiveNotifs && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Spacer to keep icons centered */}
        <div className="mt-auto mb-3" />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm" style={{ backgroundColor: 'var(--overlay)' }} onClick={closePanel} />
      )}

      <motion.aside
        initial={{ x: 340, opacity: 0 }}
        animate={{ x: isOpen ? 0 : 340, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed right-0 top-0 z-50 h-screen w-[340px] sm:w-[360px] overflow-y-auto border-l border-border-default p-5 shadow-2xl backdrop-blur-xl"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
      >
        <div className="flex items-center justify-between border-b border-border-default pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Quick tools</p>
            <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
              {activePanel === 'settings'
                ? 'Preferences'
                : activePanel === 'help'
                ? 'Help & Info'
                : 'Notifications'}
              {activePanel === 'notifications' && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    unreadCount > 0
                      ? 'bg-primary-soft text-primary border border-primary/20'
                      : 'bg-surface-alt text-muted'
                  }`}
                >
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                </span>
              )}
            </h3>
          </div>
          <button onClick={closePanel} className="rounded-xl p-2 text-muted hover:text-text-primary transition hover:bg-surface-alt" aria-label="Close panel">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {activePanel === 'settings' ? (
            <>
              {/* Theme */}
              <div className="rounded-2xl border border-border-default p-4 bg-surface-alt">
                <p className="text-sm font-semibold text-text-primary">Theme</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['default', 'light', 'dark'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className="rounded-xl border px-3 py-2 text-sm font-semibold transition-all"
                      style={theme === t
                        ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }
                      }
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Mode */}
              <div className="rounded-2xl border border-border-default p-4 bg-surface-alt">
                <p className="text-sm font-semibold text-text-primary">UI Mode</p>
                <p className="text-xs text-muted">Contrast and accent tone for buttons, highlights, and hero elements.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['black', 'green', 'saffron', 'royal'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setUiMode(mode)}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all"
                      style={uiMode === mode
                        ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }
                      }
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: UI_MODE_COLORS[mode] }}
                      />
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="rounded-2xl border border-border-default p-4 bg-surface-alt">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Font Family</p>
                  <span className="text-[11px] font-semibold text-muted">
                    {FONT_FAMILIES[fontFamily]?.name || 'Default'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">Select your preferred app typography.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.values(FONT_FAMILIES).map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFontFamily(font.id)}
                      className="rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left truncate"
                      style={{
                        fontFamily: font.value,
                        ...(fontFamily === font.id
                          ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }
                          : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }),
                      }}
                      title={font.name}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="rounded-2xl border border-border-default p-4 bg-surface-alt">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Font Size</p>
                  <span className="text-[11px] font-semibold text-muted">
                    {FONT_SIZES[fontSize]?.percentage || '100%'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">Scale text across headers, labels, and content.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.values(FONT_SIZES).map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setFontSize(size.id)}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all"
                      style={fontSize === size.id
                        ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }
                      }
                    >
                      <span>{size.label}</span>
                      <span className="text-[10px] opacity-70">{size.percentage}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Typography to Default */}
              <button
                onClick={resetTypography}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary transition-all hover:bg-surface-alt hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Typography to Default
              </button>
            </>
          ) : activePanel === 'help' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border-default p-4 text-sm bg-surface-alt text-muted">
                <p className="font-semibold text-text-primary">Need help?</p>
                <p className="mt-2">Access support resources and policy pages directly from this panel.</p>
              </div>

              <div className="rounded-2xl border border-border-default bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Quick links</p>
                <div className="mt-4 space-y-3">
                  <Link
                    to="/contact-support"
                    className="block rounded-2xl border border-border-default bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
                    onClick={closePanel}
                  >
                    Contact Support
                  </Link>
                  <Link
                    to="/privacy-policy"
                    className="block rounded-2xl border border-border-default bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
                    onClick={closePanel}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms-conditions"
                    className="block rounded-2xl border border-border-default bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
                    onClick={closePanel}
                  >
                    Terms & Conditions
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Notification Panel Shell */
            <div className="space-y-4">
              {/* Notification Header & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary-soft transition"
                      title="Mark all as read"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-muted hover:text-red-500 transition"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-border-default bg-surface-alt p-1 text-[11px] font-bold">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'UNREAD', label: `Unread (${unreadCount})` },
                  { id: 'DECISIONS', label: 'Polls' },
                  { id: 'SOCIAL', label: 'Social' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNotifFilter(tab.id)}
                    className={`rounded-lg py-1.5 text-center transition-all ${
                      notifFilter === tab.id
                        ? 'bg-surface text-primary shadow-sm'
                        : 'text-muted hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="space-y-2.5">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                          !notif.read
                            ? 'border-primary/40 bg-primary-soft/30 hover:border-primary hover:bg-primary-soft/50 shadow-sm'
                            : 'border-border-default bg-surface hover:border-border-default hover:bg-surface-alt'
                        }`}
                      >
                        {/* Icon & Unread Dot */}
                        <div className="relative shrink-0 mt-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-border-default text-primary">
                            {getNotificationIcon(notif.type)}
                          </div>
                          {!notif.read && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <span className="inline-block rounded-md bg-surface border border-border-default px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-muted">
                              {notif.badge || notif.category}
                            </span>
                            <span className="text-[10px] text-muted whitespace-nowrap">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>

                          <h4 className={`mt-1 text-xs leading-snug break-words [overflow-wrap:anywhere] ${
                            !notif.read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'
                          }`}>
                            {notif.title}
                          </h4>

                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted line-clamp-2 break-words [overflow-wrap:anywhere]">
                            {notif.message}
                          </p>
                        </div>

                        {/* Dismiss action */}
                        <button
                          onClick={(e) => handleDismiss(e, notif.id)}
                          className="absolute right-2 top-2 rounded-lg p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                          title="Dismiss notification"
                          aria-label="Dismiss notification"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  /* Empty state */
                  <div className="rounded-2xl border border-dashed border-border-default bg-surface-alt p-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-primary border border-border-default">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="mt-3 text-xs font-bold text-text-primary">You're all caught up!</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {notifFilter === 'UNREAD'
                        ? 'No unread notifications at the moment.'
                        : 'No alerts match your current filter.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
