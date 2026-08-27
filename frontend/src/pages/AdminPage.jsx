import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsersAdminApi,
  banUserAdminApi,
  unbanUserAdminApi,
  updateUserRoleAdminApi,
  getReportsAdminApi,
  resolveReportAdminApi,
  getModerationFlagsApi,
  resolveModerationFlagApi,
  getAuditLogsAdminApi,
  getAdminSettingsApi,
  updateAdminSettingApi,
} from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import Loader from '../components/Loader';

export default function AdminPage() {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // State
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [flags, setFlags] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // New Setting state
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingVal, setNewSettingVal] = useState('');
  const [newSettingDesc, setNewSettingDesc] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, accessToken]);

  const loadData = async () => {
    setLoading(true);
    setStatusMessage({ text: '', type: '' });
    try {
      if (activeTab === 'users') {
        const data = await getAllUsersAdminApi(accessToken);
        setUsers(data);
      } else if (activeTab === 'moderation') {
        const [repData, flagData] = await Promise.allSettled([
          getReportsAdminApi(accessToken),
          getModerationFlagsApi(accessToken),
        ]);
        setReports(repData.status === 'fulfilled' ? repData.value : []);
        setFlags(flagData.status === 'fulfilled' ? flagData.value : []);
      } else if (activeTab === 'audit') {
        const logs = await getAuditLogsAdminApi(accessToken);
        setAuditLogs(logs);
      } else if (activeTab === 'settings') {
        const st = await getAdminSettingsApi(accessToken);
        setSettings(st);
      }
    } catch (err) {
      setStatusMessage({ text: 'Failed to load administrative data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserBan = async (targetUser) => {
    const isCurrentlyActive = targetUser.isActive !== false;
    setActionLoading(`ban-${targetUser.id}`);
    try {
      if (isCurrentlyActive) {
        await banUserAdminApi(targetUser.id, accessToken);
        setStatusMessage({ text: `User ${targetUser.name || targetUser.email} has been deactivated.`, type: 'success' });
      } else {
        await unbanUserAdminApi(targetUser.id, accessToken);
        setStatusMessage({ text: `User ${targetUser.name || targetUser.email} has been reactivated.`, type: 'success' });
      }
      // Refresh user list
      const updated = await getAllUsersAdminApi(accessToken);
      setUsers(updated);
    } catch (err) {
      setStatusMessage({ text: err.message || 'Action failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(`role-${userId}`);
    try {
      await updateUserRoleAdminApi(userId, newRole, accessToken);
      setStatusMessage({ text: `User role successfully updated to ${newRole}.`, type: 'success' });
      const updated = await getAllUsersAdminApi(accessToken);
      setUsers(updated);
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to update user role.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Moderation Actions
  const handleResolveReport = async (reportId) => {
    setActionLoading(`report-${reportId}`);
    try {
      await resolveReportAdminApi(reportId, accessToken);
      setStatusMessage({ text: 'Report marked as resolved.', type: 'success' });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to resolve report.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveFlag = async (flagId) => {
    setActionLoading(`flag-${flagId}`);
    try {
      await resolveModerationFlagApi(flagId, accessToken);
      setStatusMessage({ text: 'Moderation flag resolved.', type: 'success' });
      setFlags((prev) => prev.filter((f) => f.id !== flagId));
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to resolve flag.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Settings Actions
  const handleSaveSetting = async (e) => {
    e.preventDefault();
    if (!newSettingKey.trim()) return;
    setActionLoading('save-setting');
    try {
      await updateAdminSettingApi(newSettingKey.trim(), newSettingVal, newSettingDesc, accessToken);
      setStatusMessage({ text: `Setting '${newSettingKey}' saved successfully.`, type: 'success' });
      setNewSettingKey('');
      setNewSettingVal('');
      setNewSettingDesc('');
      const updated = await getAdminSettingsApi(accessToken);
      setSettings(updated);
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to save setting.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold text-sm">
                    🛡️
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Control Center</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-text-primary">Platform Administration</h1>
                <p className="mt-1 text-sm text-secondary">
                  Manage registered users, review flagged content reports, inspect audit trails, and configure platform settings.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-surface p-1 border border-border-default shadow-xs">
                {[
                  { id: 'users', label: 'Users', icon: '👥' },
                  { id: 'moderation', label: 'Moderation', icon: '🚩' },
                  { id: 'audit', label: 'Audit Logs', icon: '📋' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Feedback Notification */}
            {statusMessage.text && (
              <div
                className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300'
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  onClick={() => setStatusMessage({ text: '', type: '' })}
                  className="text-xs font-bold opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Tab 1: User Management */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="app-input pl-10 pr-4 py-2.5 text-xs sm:text-sm"
                    />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-muted">
                    Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loading ? (
                  <Loader message="Loading user directory..." />
                ) : (
                  <div className="rounded-[2rem] border border-border-default bg-surface shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="border-b border-border-default bg-surface-alt text-muted text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3.5 px-4">User</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Joined</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-muted">
                                No users matched your search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((u) => {
                              const isActive = u.isActive !== false;
                              const isSelf = user && (user.id === u.id || user.email === u.email);
                              return (
                                <tr key={u.id} className="hover:bg-surface-alt/50 transition">
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      {u.avatar ? (
                                        <img src={u.avatar} alt="" className="h-8 w-8 rounded-full bg-primary-soft" />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                          {(u.name || u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="font-bold text-text-primary truncate">{u.name || u.fullName || 'User'}</p>
                                        <p className="text-xs text-muted truncate">{u.email}</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <select
                                      value={u.role || 'USER'}
                                      disabled={isSelf || actionLoading === `role-${u.id}`}
                                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                      className="rounded-xl border border-border-default bg-surface px-2.5 py-1 text-xs font-bold text-text-primary focus:border-primary disabled:opacity-50"
                                    >
                                      <option value="USER">USER</option>
                                      <option value="MODERATOR">MODERATOR</option>
                                      <option value="ADMIN">ADMIN</option>
                                    </select>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        isActive
                                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-red-500/10 text-red-700 dark:text-red-300'
                                      }`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          isActive ? 'bg-emerald-500' : 'bg-red-500'
                                        }`}
                                      />
                                      {isActive ? 'Active' : 'Deactivated'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-xs text-muted">
                                    {u.createdAt
                                      ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                      : '—'}
                                  </td>

                                  <td className="py-3.5 px-4 text-right">
                                    {!isSelf ? (
                                      <button
                                        onClick={() => handleToggleUserBan(u)}
                                        disabled={actionLoading === `ban-${u.id}`}
                                        className={`rounded-xl px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
                                          isActive
                                            ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:border-red-800'
                                            : 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800'
                                        }`}
                                      >
                                        {actionLoading === `ban-${u.id}`
                                          ? '...'
                                          : isActive
                                          ? 'Deactivate'
                                          : 'Reactivate'}
                                      </button>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-muted">Current User</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Moderation & Reports */}
            {activeTab === 'moderation' && (
              <div className="space-y-6">
                {loading ? (
                  <Loader message="Loading content reports & flags..." />
                ) : (
                  <div className="grid gap-6">
                    {/* Content Reports */}
                    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border-default pb-3">
                        <h2 className="text-lg font-black text-text-primary">Content Reports ({reports.length})</h2>
                        <span className="text-xs font-semibold text-muted">User submissions</span>
                      </div>

                      {reports.length === 0 ? (
                        <p className="text-sm text-muted py-4 text-center">No pending content reports 🎉</p>
                      ) : (
                        <div className="space-y-3">
                          {reports.map((report) => (
                            <div
                              key={report.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-default bg-surface-alt p-4"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                                    {report.contentType || 'CONTENT'} #{report.contentId || '—'}
                                  </span>
                                  <span className="text-xs text-muted">
                                    Reported by: {report.reporter?.email || report.reporter?.fullName || 'Anonymous'}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-text-primary">{report.reason}</p>
                              </div>

                              <button
                                onClick={() => handleResolveReport(report.id)}
                                disabled={actionLoading === `report-${report.id}`}
                                className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-60 shadow-xs"
                              >
                                {actionLoading === `report-${report.id}` ? 'Resolving...' : '✓ Mark Resolved'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Moderation Flags */}
                    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border-default pb-3">
                        <h2 className="text-lg font-black text-text-primary">Moderation Flags ({flags.length})</h2>
                        <span className="text-xs font-semibold text-muted">Automated / Moderator alerts</span>
                      </div>

                      {flags.length === 0 ? (
                        <p className="text-sm text-muted py-4 text-center">No active moderation flags 🎉</p>
                      ) : (
                        <div className="space-y-3">
                          {flags.map((flag) => (
                            <div
                              key={flag.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-default bg-surface-alt p-4"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                                    {flag.targetType || 'FLAG'} #{flag.targetId || '—'}
                                  </span>
                                  <span className="text-xs text-muted">Status: {flag.status}</span>
                                </div>
                                <p className="text-sm font-semibold text-text-primary">{flag.reason}</p>
                              </div>

                              <button
                                onClick={() => handleResolveFlag(flag.id)}
                                disabled={actionLoading === `flag-${flag.id}`}
                                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-xs"
                              >
                                {actionLoading === `flag-${flag.id}` ? 'Resolving...' : '✓ Resolve Flag'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Audit Logs */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                {loading ? (
                  <Loader message="Fetching platform audit trail..." />
                ) : (
                  <div className="rounded-[2rem] border border-border-default bg-surface shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border-default bg-surface-alt text-muted text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3.5 px-4">Timestamp</th>
                            <th className="py-3.5 px-4">Actor</th>
                            <th className="py-3.5 px-4">Action</th>
                            <th className="py-3.5 px-4">Target Entity</th>
                            <th className="py-3.5 px-4">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-muted">
                                No audit events logged yet.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.map((log, idx) => (
                              <tr key={log.id || idx} className="hover:bg-surface-alt/50 transition">
                                <td className="py-3 px-4 text-muted whitespace-nowrap">
                                  {log.createdAt
                                    ? new Date(log.createdAt).toLocaleString()
                                    : 'Recently'}
                                </td>
                                <td className="py-3 px-4 font-bold text-text-primary">
                                  {log.userEmail || log.actor || 'System'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-text-secondary">
                                  {log.entityType ? `${log.entityType} #${log.entityId || ''}` : '—'}
                                </td>
                                <td className="py-3 px-4 text-muted max-w-xs truncate">
                                  {log.details || log.description || '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: System Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {loading ? (
                  <Loader message="Loading system settings..." />
                ) : (
                  <>
                    {/* Add / Update Setting Form */}
                    <div className="rounded-[2rem] border border-border-default bg-surface p-6 shadow-sm">
                      <h2 className="text-lg font-black text-text-primary mb-1">Set Configuration Variable</h2>
                      <p className="text-xs text-muted mb-4">Define platform-wide environment switches or system parameters.</p>
                      
                      <form onSubmit={handleSaveSetting} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          required
                          placeholder="Key (e.g. PLATFORM_MAINTENANCE)"
                          value={newSettingKey}
                          onChange={(e) => setNewSettingKey(e.target.value)}
                          className="app-input px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Value (e.g. true / 50)"
                          value={newSettingVal}
                          onChange={(e) => setNewSettingVal(e.target.value)}
                          className="app-input px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newSettingDesc}
                            onChange={(e) => setNewSettingDesc(e.target.value)}
                            className="app-input px-3 py-2 text-xs flex-1"
                          />
                          <button
                            type="submit"
                            disabled={actionLoading === 'save-setting'}
                            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shrink-0 disabled:opacity-60"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Current Settings Table */}
                    <div className="rounded-[2rem] border border-border-default bg-surface shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-border-default bg-surface-alt text-muted text-[11px] uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="py-3.5 px-4">Key</th>
                              <th className="py-3.5 px-4">Value</th>
                              <th className="py-3.5 px-4">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-default">
                            {settings.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="py-8 text-center text-muted">
                                  No custom system settings defined yet.
                                </td>
                              </tr>
                            ) : (
                              settings.map((s, idx) => (
                                <tr key={s.id || idx} className="hover:bg-surface-alt/50 transition">
                                  <td className="py-3.5 px-4 font-mono font-bold text-text-primary">
                                    {s.settingKey}
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-primary">
                                    {s.settingValue}
                                  </td>
                                  <td className="py-3.5 px-4 text-muted">
                                    {s.description || '—'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
