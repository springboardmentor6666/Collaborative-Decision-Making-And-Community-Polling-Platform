/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Profile.jsx
 * Architecture Tier: Page Component (View Layer)
 * Path: frontend/src/pages/Profile.jsx
 *
 * Purpose:
 *   User profile page displaying personal details, bio, avatar, interest topics, voting activity history, and bookmarked decisions.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import { FONT_FAMILIES, FONT_SIZES, THEMES, UI_MODES } from '../theme/themes';
import {
  getSavedDecisionsApi,
  getCurrentUserApi,
  deactivateAccountApi,
  reactivateAccountApi,
  scheduleAccountDeletionApi,
  cancelAccountDeletionApi,
  getMySubmittedReportsApi,
  getMyModerationNoticesApi,
  deleteReportApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from '../api/axiosClient';
import { useAlert } from '../context/AlertContext';
import { useRefresh } from '../context/RefreshContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import InterestTaxonomyEditor from '../components/InterestTaxonomyEditor';
import DecisionCard from '../components/DecisionCard';
import Loader from '../components/Loader';
import RecentActivityFeed from '../components/activity/RecentActivityFeed';
import { Link } from 'react-router-dom';

const UI_MODE_COLORS = {
  black: '#0f172a',
  green: '#16a34a',
  saffron: '#f59e0b',
  royal: '#2563eb',
};

export default function Profile() {
  const { user, accessToken, updateUser } = useAuth();
  const { showAlert, showError, showConfirm } = useAlert();
  const { triggerRefresh } = useRefresh();
  const {
    theme,
    uiMode,
    fontFamily,
    fontSize,
    setTheme,
    setUiMode,
    setFontFamily,
    setFontSize,
    resetTypography,
  } = useTheme();

  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('account');
  const [savedDecisions, setSavedDecisions] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // User Reports & Moderation Notices State
  const [submittedReports, setSubmittedReports] = useState([]);
  const [moderationNotices, setModerationNotices] = useState([]);
  const [loadingModeration, setLoadingModeration] = useState(false);

  // Account Lifecycle states
  const [deactivateDuration, setDeactivateDuration] = useState('14');
  const [customDeactivateDate, setCustomDeactivateDate] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (accessToken) {
      getCurrentUserApi(accessToken)
        .then((userData) => {
          if (userData) {
            setCurrentUser(userData);
            if (updateUser) updateUser(userData);
          }
        })
        .catch(() => {});
    }
  }, [accessToken, updateUser]);

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    pollExpiration: true,
    newDecisionInTopic: true,
    commentOnDecision: true,
    replyOnComment: true,
    reactionOnComment: true,
    communityUpdates: true,
    moderationAlerts: true,
    securityAlerts: true,
    digestEmails: false,
    pushNotifications: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'google') {
      showAlert({ title: 'Connected!', message: 'Your Google account has been connected successfully.', type: 'success' });
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedDecisions();
    } else if (activeTab === 'moderation') {
      loadModerationData();
    } else if (activeTab === 'notifications') {
      loadPreferences();
    }
  }, [activeTab, accessToken]);

  useEffect(() => {
    const handleRefresh = () => {
      if (activeTab === 'saved') loadSavedDecisions();
      else if (activeTab === 'moderation') loadModerationData();
      else if (activeTab === 'notifications') loadPreferences();
    };
    window.addEventListener('decisionhub:refresh', handleRefresh);
    return () => window.removeEventListener('decisionhub:refresh', handleRefresh);
  }, [activeTab, accessToken]);

  const loadPreferences = async () => {
    if (!accessToken) return;
    try {
      setLoadingPrefs(true);
      const data = await getNotificationPreferencesApi(accessToken);
      if (data) {
        setPreferences(data);
      }
    } catch {
      // Keep existing
    } finally {
      setLoadingPrefs(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      setSavingPrefs(true);
      await updateNotificationPreferencesApi(updated, accessToken);
    } catch (err) {
      showError(err, 'Failed to update notification preference.');
      setPreferences(preferences);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleConnectGoogle = () => {
    const oauthBase = (import.meta.env.VITE_OAUTH_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    window.location.href = `${oauthBase}/oauth2/authorization/google?returnTo=/profile`;
  };

  const handleDeleteUserReport = async (reportId) => {
    const confirmed = await showConfirm({
      title: 'Withdraw Report',
      message: 'Are you sure you want to withdraw and delete this report submission?',
      confirmText: 'Withdraw Report',
      isDangerous: true,
    });
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await deleteReportApi(reportId, accessToken);
      showAlert({ title: 'Report Withdrawn', message: 'Your report has been withdrawn successfully.', type: 'success' });
      setSubmittedReports((prev) => prev.filter((r) => r.id !== reportId));
      triggerRefresh();
    } catch (err) {
      showError(err, 'Failed to withdraw report.');
    } finally {
      setActionLoading(false);
    }
  };

  const loadSavedDecisions = async () => {
    if (!accessToken) return;
    try {
      setLoadingSaved(true);
      const data = await getSavedDecisionsApi(accessToken);
      setSavedDecisions(data);
    } catch {
      setSavedDecisions([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadModerationData = async () => {
    if (!accessToken) return;
    try {
      setLoadingModeration(true);
      const [reports, notices] = await Promise.allSettled([
        getMySubmittedReportsApi(accessToken),
        getMyModerationNoticesApi(accessToken),
      ]);
      setSubmittedReports(reports.status === 'fulfilled' ? reports.value : []);
      setModerationNotices(notices.status === 'fulfilled' ? notices.value : []);
    } catch {
      setSubmittedReports([]);
      setModerationNotices([]);
    } finally {
      setLoadingModeration(false);
    }
  };

  const handleBookmarkToggled = (decisionId, isSaved) => {
    if (!isSaved) {
      setSavedDecisions((prev) => prev.filter((d) => d.id !== decisionId));
    }
  };

  const currentStatus = currentUser?.accountStatus || 'ACTIVE';

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const handleDeactivate = async () => {
    let durationDays = null;
    let customUntilDate = null;
    let desc = '';

    if (deactivateDuration === 'custom') {
      if (!customDeactivateDate) {
        showError(null, 'Please select a future reactivation date.');
        return;
      }
      customUntilDate = `${customDeactivateDate}T23:59:59`;
      desc = `until ${new Date(customDeactivateDate).toLocaleDateString()}`;
    } else {
      durationDays = parseInt(deactivateDuration, 10) || 14;
      desc = `for ${durationDays} days`;
    }

    const confirmed = await showConfirm({
      title: 'Confirm Account Deactivation',
      message: `Are you sure you want to temporarily deactivate your account ${desc}? Your profile data and contributions will remain preserved and you can reactivate anytime.`,
      confirmText: 'Yes, Deactivate',
      cancelText: 'Cancel',
      isDangerous: false,
    });

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const updated = await deactivateAccountApi({ durationDays, customUntilDate }, accessToken);
      setCurrentUser(updated);
      if (updateUser) updateUser(updated);
      showAlert('Account Deactivated', `Your account is temporarily deactivated ${desc}. You can reactivate whenever you log back in.`);
    } catch (err) {
      showError(err, 'Failed to deactivate account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    const confirmed = await showConfirm({
      title: 'Reactivate Account',
      message: 'Restore full active status to your account now?',
      confirmText: 'Reactivate Account',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const updated = await reactivateAccountApi(accessToken);
      setCurrentUser(updated);
      if (updateUser) updateUser(updated);
      showAlert('Welcome Back!', 'Your account has been successfully reactivated to Active status.');
    } catch (err) {
      showError(err, 'Failed to reactivate account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      showError(null, 'Please type DELETE exactly to confirm.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Schedule 14-Day Account Deletion',
      message:
        'A 14-day hold period will begin. You can cancel this request at any time during the next 14 days. After 14 days, personal data is permanently wiped and collaborative public contributions will be anonymized. Proceed?',
      confirmText: 'Schedule Deletion',
      cancelText: 'Keep My Account',
      isDangerous: true,
    });

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const updated = await scheduleAccountDeletionApi('DELETE', accessToken);
      setCurrentUser(updated);
      if (updateUser) updateUser(updated);
      setDeleteConfirmText('');
      showAlert(
        'Deletion Scheduled',
        `Your account deletion has been scheduled. You have until ${
          updated.scheduledDeletionAt
            ? new Date(updated.scheduledDeletionAt).toLocaleString()
            : '14 days'
        } to cancel this request.`
      );
    } catch (err) {
      showError(err, 'Failed to schedule account deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    const confirmed = await showConfirm({
      title: 'Cancel Account Deletion',
      message: 'Are you sure you want to cancel the scheduled deletion and keep your account active?',
      confirmText: 'Keep Account',
      cancelText: 'Go Back',
    });

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const updated = await cancelAccountDeletionApi(accessToken);
      setCurrentUser(updated);
      if (updateUser) updateUser(updated);
      showAlert('Deletion Cancelled', 'Your scheduled deletion has been cancelled. Your account is active.');
    } catch (err) {
      showError(err, 'Failed to cancel deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  const infoTiles = [
    {
      label: 'Account Name',
      value: user.name || user.fullName || '—',
      icon: (
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Email Address',
      value: user.email || '—',
      icon: (
        <svg className="h-5 w-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Member Since',
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Active Member',
      icon: (
        <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Role',
      value: user.role || 'USER',
      icon: (
        <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
            
            {/* Header + Tabs */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-text-primary">Profile & Preferences</h1>
                <p className="mt-1 text-muted">Manage your account information, topic interests, and personal timeline.</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-surface p-1 border border-border-default shadow-xs">
                {[
                  { id: 'account', label: 'Account & Display', icon: '👤' },
                  { id: 'notifications', label: 'Notifications', icon: '🔔' },
                  { id: 'interests', label: 'Topic Interests', icon: '🏷️' },
                  { id: 'saved', label: 'Saved Decisions', icon: '🔖' },
                  { id: 'activity', label: 'My Activity', icon: '⚡' },
                  { id: 'moderation', label: 'Reports & Notices', icon: '🛡️' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      activeTab === t.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile hero card */}
            <div className="mb-6 rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email}
                    className="h-16 w-16 rounded-full ring-4"
                    style={{ '--tw-ring-color': 'var(--primary-soft)' }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-white">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black tracking-tight text-text-primary">{user.name || user.fullName || 'User'}</h2>
                  <p className="text-sm text-muted">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {user.role || 'USER'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        currentStatus === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : currentStatus === 'DEACTIVATED'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          currentStatus === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : currentStatus === 'DEACTIVATED'
                            ? 'bg-amber-500'
                            : 'bg-rose-500 animate-pulse'
                        }`}
                      />
                      {currentStatus === 'ACTIVE'
                        ? 'Active'
                        : currentStatus === 'DEACTIVATED'
                        ? 'Deactivated'
                        : 'Scheduled for Deletion (14-Day Hold)'}
                    </span>
                    {user.role?.toUpperCase() === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
                      >
                        🛡️ Open Admin Panel
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 1: Account & Display Preferences */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Info tiles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {infoTiles.map((tile) => (
                    <div
                      key={tile.label}
                      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface p-4 shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
                        {tile.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">{tile.label}</p>
                        <p className="text-sm font-semibold text-text-primary">{tile.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Appearance & Accessibility Customization */}
                <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">Display & Accessibility</h2>
                      <p className="text-xs text-muted">Customize typography, scale, and theme across DecisionHub.</p>
                    </div>
                    <button
                      onClick={resetTypography}
                      className="flex items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-surface-alt hover:text-text-primary"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Typography
                    </button>
                  </div>

                  {/* Font Family */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-text-primary">Font Family</label>
                      <span className="text-xs font-semibold text-muted">
                        Active: {FONT_FAMILIES[fontFamily]?.name || 'Default'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {Object.values(FONT_FAMILIES).map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setFontFamily(font.id)}
                          className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                            fontFamily === font.id
                              ? 'border-primary bg-primary-soft shadow-sm'
                              : 'border-border-default bg-surface hover:bg-surface-alt'
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          <span className={`text-sm font-bold ${fontFamily === font.id ? 'text-primary' : 'text-text-primary'}`}>
                            {font.name}
                          </span>
                          <span className="mt-0.5 text-[11px] text-muted">
                            {font.id === 'system' ? 'Native System' : 'Google Font'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-text-primary">Font Size Scale</label>
                      <span className="text-xs font-semibold text-muted">
                        Scale: {FONT_SIZES[fontSize]?.percentage || '100%'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {Object.values(FONT_SIZES).map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setFontSize(size.id)}
                          className={`flex flex-col items-center justify-center rounded-2xl border py-3 px-2 text-center transition-all ${
                            fontSize === size.id
                              ? 'border-primary bg-primary-soft text-primary shadow-sm'
                              : 'border-border-default bg-surface text-text-primary hover:bg-surface-alt'
                          }`}
                        >
                          <span className="text-sm font-bold">{size.label}</span>
                          <span className="mt-0.5 text-[11px] opacity-70">{size.percentage}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme & UI Mode */}
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-text-primary">Color Theme</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(THEMES).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                              theme === t
                                ? 'border-primary bg-primary-soft text-primary'
                                : 'border-border-default bg-surface text-text-primary hover:bg-surface-alt'
                            }`}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-text-primary">UI Accent</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(UI_MODES).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setUiMode(mode)}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                              uiMode === mode
                                ? 'border-primary bg-primary-soft text-primary'
                                : 'border-border-default bg-surface text-text-primary hover:bg-surface-alt'
                            }`}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: UI_MODE_COLORS[mode] }}
                            />
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Sample */}
                  <div className="rounded-2xl border border-dashed border-border-default bg-background p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Live Preview</p>
                    <h3 className="text-base font-black text-text-primary">
                      DecisionHub Typography & Accessibility
                    </h3>
                    <p className="mt-1 text-sm text-secondary">
                      This text dynamically reflects your chosen font family and size scale in real-time across cards, forms, tables, and discussions.
                    </p>
                  </div>
                </div>

                {/* Security & Connected Accounts */}
                <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <span>🔐</span> Security & Connected Accounts
                    </h2>
                    <p className="text-xs text-muted">Manage your authentication methods and linked Google identity.</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-default bg-surface-alt p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs border border-border-default">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Google Account</p>
                        <p className="text-xs text-muted">
                          {currentUser?.provider === 'GOOGLE' || currentUser?.providerId
                            ? `Connected to Google (${currentUser?.providerId ? 'ID: ' + currentUser.providerId.slice(0, 10) + '...' : 'Linked'})`
                            : 'Not connected. Connect Google to sign in with either your password or Google account.'}
                        </p>
                      </div>
                    </div>

                    {currentUser?.provider === 'GOOGLE' || currentUser?.providerId ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectGoogle}
                        className="rounded-xl border border-border-default bg-surface px-4 py-2 text-xs font-bold text-text-primary hover:bg-surface-alt shadow-xs transition flex items-center gap-2"
                      >
                        <span>Connect Google</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Lifecycle & Danger Zone */}
                <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-6">
                  <div className="border-b border-border-default pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                          <span>🛡️</span> Account Management & Lifecycle
                        </h2>
                        <p className="text-xs text-muted">
                          Manage your account status, temporary deactivation periods, or scheduled 14-day deletion.
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          currentStatus === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : currentStatus === 'DEACTIVATED'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : currentStatus === 'PENDING_DELETION'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-muted/10 text-muted border border-border-default'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            currentStatus === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : currentStatus === 'DEACTIVATED'
                              ? 'bg-amber-500'
                              : currentStatus === 'PENDING_DELETION'
                              ? 'bg-rose-500 animate-pulse'
                              : 'bg-muted'
                          }`}
                        />
                        {currentStatus === 'ACTIVE' && 'Status: Active'}
                        {currentStatus === 'DEACTIVATED' && 'Status: Deactivated'}
                        {currentStatus === 'PENDING_DELETION' && 'Status: Scheduled for Deletion'}
                      </span>
                    </div>
                  </div>

                  {/* Pending Deletion Active Warning Banner */}
                  {currentStatus === 'PENDING_DELETION' && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                            Account Scheduled for Permanent Deletion (14-Day Hold Active)
                          </h3>
                          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                            Your account is currently in a 14-day hold period. Permanent deletion is scheduled for{' '}
                            <strong className="font-semibold">
                              {currentUser?.scheduledDeletionAt
                                ? new Date(currentUser.scheduledDeletionAt).toLocaleString()
                                : '14 days after request'}
                            </strong>.
                          </p>
                          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                            When the hold expires, your profile details, tokens, and bookmarks will be completely erased.
                            Your collaborative public contributions (decisions, comments, votes) will remain intact and be anonymized under "Deleted User".
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCancelDeletion}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-surface border border-rose-500/40 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-200 hover:bg-rose-500/20 transition disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : '↺ Cancel Scheduled Deletion & Keep Account'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Deactivated Active Notice Banner */}
                  {currentStatus === 'DEACTIVATED' && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⏸️</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                            Account Is Currently Deactivated
                          </h3>
                          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                            Your account is temporarily disabled until{' '}
                            <strong className="font-semibold">
                              {currentUser?.deactivateUntil
                                ? new Date(currentUser.deactivateUntil).toLocaleDateString()
                                : 'manual reactivation'}
                            </strong>. All your personal data is preserved and your account will automatically restore, or you can reactivate immediately below.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleReactivate}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                        >
                          {actionLoading ? 'Reactivating...' : '▶ Reactivate Account Now'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Temporary Deactivation Settings (when ACTIVE) */}
                  {currentStatus === 'ACTIVE' && (
                    <div className="space-y-4 rounded-2xl border border-border-default bg-surface-alt/40 p-5">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                          <span>⏸️</span> Temporary Account Deactivation
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          Pause your account for a defined period. All your data is safely preserved, and the account can be re-enabled at any time.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '7 Days', val: '7' },
                          { label: '14 Days', val: '14' },
                          { label: '30 Days', val: '30' },
                          { label: '60 Days', val: '60' },
                          { label: '90 Days', val: '90' },
                          { label: 'Custom Date', val: 'custom' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setDeactivateDuration(item.val)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                              deactivateDuration === item.val
                                ? 'border-primary bg-primary-soft text-primary font-bold shadow-xs'
                                : 'border-border-default bg-surface text-text-secondary hover:bg-surface-alt'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {deactivateDuration === 'custom' && (
                        <div className="pt-1">
                          <label className="block text-xs font-semibold text-text-primary mb-1">
                            Choose reactivation date:
                          </label>
                          <input
                            type="date"
                            min={tomorrowStr}
                            value={customDeactivateDate}
                            onChange={(e) => setCustomDeactivateDate(e.target.value)}
                            className="app-input max-w-xs py-1.5 px-3 text-xs"
                          />
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleDeactivate}
                          disabled={actionLoading || (deactivateDuration === 'custom' && !customDeactivateDate)}
                          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Deactivate Account'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 14-Day Hold Deletion Zone (when ACTIVE) */}
                  {currentStatus === 'ACTIVE' && (
                    <div className="space-y-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
                      <div>
                        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                          <span>⚠️</span> Danger Zone: Delete Account (14-Day Hold)
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Requesting account deletion initiates a <strong className="text-text-primary">14-day hold period</strong>.
                          During these 14 days, you can sign back in and cancel the deletion at any time.
                          When the hold period expires, private profile data will be permanently wiped, and public collaborative contributions
                          (decisions, comments, votes) will be anonymized ("Deleted User") to safeguard community polls.
                        </p>
                      </div>

                      <div className="space-y-2 max-w-md">
                        <label className="block text-xs font-bold text-text-primary">
                          To confirm, type <span className="text-rose-600 font-black">DELETE</span> below:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder='Type "DELETE" to confirm'
                          className="app-input py-2 px-3 text-xs border-rose-300 dark:border-rose-900 focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleScheduleDeletion}
                          disabled={actionLoading || deleteConfirmText.trim() !== 'DELETE'}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Scheduling...' : 'Schedule Account Deletion (14-Day Hold)'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Notification Preferences */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-text-primary">Notification Preferences</h2>
                    <p className="text-xs text-muted">
                      Control which platform alerts and updates you receive. Changes are saved automatically to your profile.
                    </p>
                  </div>
                  {savingPrefs && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.2" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving preferences...
                    </span>
                  )}
                </div>

                {loadingPrefs ? (
                  <Loader message="Loading notification preferences..." />
                ) : (
                  <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-3.5">
                    {[
                      {
                        key: 'pollExpiration',
                        title: 'Poll Expiration & Final Results',
                        desc: 'Receive alerts when polls you participated in or created reach their expiration deadline.',
                        icon: '⏳',
                      },
                      {
                        key: 'newDecisionInTopic',
                        title: 'Topic & Recommendation Feed',
                        desc: 'Get notified when new polls and collaborative decisions are published matching your followed topics.',
                        icon: '💡',
                      },
                      {
                        key: 'commentOnDecision',
                        title: 'Comments on My Decisions',
                        desc: 'Alerts when members post questions, suggestions, or comments on your decisions.',
                        icon: '💬',
                      },
                      {
                        key: 'replyOnComment',
                        title: 'Replies to My Comments',
                        desc: 'Notifications when someone responds directly to one of your discussion comments.',
                        icon: '↩️',
                      },
                      {
                        key: 'reactionOnComment',
                        title: 'Comment Upvotes & Reactions',
                        desc: 'Updates when your comments or proposals receive upvotes from fellow community members.',
                        icon: '👍',
                      },
                      {
                        key: 'communityUpdates',
                        title: 'Community Announcements & Chat',
                        desc: 'Notifications about community membership updates, broadcasts, and discussions.',
                        icon: '👥',
                      },
                      {
                        key: 'moderationAlerts',
                        title: 'Content Moderation & Flag Alerts',
                        desc: 'Important notices if your submitted decisions or comments are flagged, reported, or reviewed.',
                        icon: '🛡️',
                      },
                      {
                        key: 'securityAlerts',
                        title: 'Security & Account Notices',
                        desc: 'Critical notices regarding password changes, Google account connections, and profile status.',
                        icon: '🔒',
                      },
                      {
                        key: 'digestEmails',
                        title: 'Periodic Email Digest',
                        desc: 'Weekly summary of trending community polls, discussions, and decision insights.',
                        icon: '📬',
                      },
                      {
                        key: 'pushNotifications',
                        title: 'Browser Push Notifications',
                        desc: 'Enable instant browser push alerts when you are active on DecisionHub.',
                        icon: '🔔',
                      },
                    ].map((item) => {
                      const enabled = preferences[item.key] ?? true;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-border-default bg-surface-alt p-4 transition hover:border-primary-soft"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border-default text-lg shadow-2xs">
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
                              <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.desc}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            onClick={() => handleTogglePreference(item.key)}
                            disabled={savingPrefs}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              enabled ? 'bg-primary' : 'bg-muted/40 dark:bg-muted/30'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Topic Interests Editor */}
            {activeTab === 'interests' && (
              <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-text-primary">Your Topic Interests</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Select the categories and domains you are most interested in participating in.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-default">
                  <InterestTaxonomyEditor autoSave={false} />
                </div>
              </div>
            )}

            {/* Tab 3: Saved / Bookmarked Decisions */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-text-primary">Bookmarked Decisions</h2>
                  <p className="text-xs text-muted">
                    Quickly access decisions you have saved for later review or follow-up.
                  </p>
                </div>

                {loadingSaved ? (
                  <Loader message="Loading saved bookmarks..." />
                ) : savedDecisions.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-border-default bg-surface p-12 text-center space-y-4">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">
                      🔖
                    </div>
                    <div>
                      <p className="text-base font-bold text-text-primary">No Saved Decisions Yet</p>
                      <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                        Click the bookmark icon on any decision card across your dashboard or communities to pin it here.
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition"
                    >
                      Browse Decision Stream →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {savedDecisions.map((decision) => (
                      <DecisionCard
                        key={decision.id}
                        decision={decision}
                        isSavedInitially={true}
                        onBookmarkToggled={handleBookmarkToggled}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: My Activity Timeline */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-text-primary">My Activity Timeline</h2>
                  <p className="text-xs text-muted">
                    Track all your poll votes, decisions created, and community contributions.
                  </p>
                </div>

                <div className="h-[600px]">
                  <RecentActivityFeed
                    feedType="USER"
                    targetId={user.id}
                    showHeader={true}
                    limit={25}
                  />
                </div>
              </div>
            )}

            {/* Tab 5: My Reports & Content Moderation Notices */}
            {activeTab === 'moderation' && (
              <div className="space-y-8">
                {/* Moderation Notices on User Content */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                      <span>Moderation Notices on My Content</span>
                      {moderationNotices.length > 0 && (
                        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          {moderationNotices.length}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted">
                      Feedback, review outcomes, and modification requests from platform administrators regarding your decisions or comments.
                    </p>
                  </div>

                  {loadingModeration ? (
                    <Loader message="Loading moderation notices..." />
                  ) : moderationNotices.length === 0 ? (
                    <div className="rounded-2xl border border-border-default bg-surface-alt p-6 text-center text-xs text-muted">
                      ✨ Great standing! You have no active moderation warnings or notices.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moderationNotices.map((notice) => (
                        <div
                          key={notice.id}
                          className="rounded-2xl border border-border-default bg-surface p-4 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-primary-soft text-primary font-mono text-[10px] font-bold px-1.5 py-0.5 uppercase">
                              {notice.contentType} #{notice.contentId || '—'}
                            </span>
                            <span className="text-[11px] text-muted">
                              {notice.reviewedAt ? new Date(notice.reviewedAt).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-text-primary">
                            Target: "{notice.contentTitle || `Content #${notice.contentId}`}"
                          </p>

                          <div className="rounded-xl bg-surface-alt p-3 text-xs space-y-1">
                            <p className="font-semibold text-text-primary">
                              <b>Moderator Feedback:</b> {notice.moderationReason || 'Content reviewed.'}
                            </p>
                            <p className="text-muted">
                              <b>Action Taken:</b> {notice.moderationAction?.replace('_', ' ')}
                            </p>
                          </div>

                          {notice.contentUrl && notice.contentExists && (
                            <div className="pt-1 flex justify-end">
                              <Link
                                to={notice.contentUrl}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                View & Edit Content →
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reports Filed by Current User */}
                <div className="space-y-4 pt-4 border-t border-border-default">
                  <div>
                    <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                      <span>Reports I Have Submitted</span>
                      {submittedReports.length > 0 && (
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                          {submittedReports.length}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted">
                      Status of inappropriate or problematic content you reported for review.
                    </p>
                  </div>

                  {loadingModeration ? (
                    <Loader message="Loading submitted reports..." />
                  ) : submittedReports.length === 0 ? (
                    <div className="rounded-2xl border border-border-default bg-surface-alt p-6 text-center text-xs text-muted">
                      You haven't submitted any content reports.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submittedReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="rounded-2xl border border-border-default bg-surface p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold px-1.5 py-0.5 uppercase">
                                {rep.contentType} #{rep.contentId || '—'}
                              </span>
                              <span className="text-[11px] text-muted">
                                {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-text-primary">Reason: {rep.reason}</p>
                            {rep.description && (
                              <p className="text-xs text-muted line-clamp-1">{rep.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              rep.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {rep.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUserReport(rep.id)}
                              disabled={actionLoading}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:border-red-800 disabled:opacity-50 transition shadow-2xs"
                              title="Withdraw and delete this report"
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
