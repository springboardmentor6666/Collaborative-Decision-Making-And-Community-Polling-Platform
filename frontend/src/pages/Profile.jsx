import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import { FONT_FAMILIES, FONT_SIZES, THEMES, UI_MODES } from '../theme/themes';
import { getSavedDecisionsApi } from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';
import InterestTaxonomyEditor from '../components/InterestTaxonomyEditor';
import DecisionCard from '../components/DecisionCard';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

const UI_MODE_COLORS = {
  black: '#0f172a',
  green: '#16a34a',
  saffron: '#f59e0b',
  royal: '#2563eb',
};

export default function Profile() {
  const { user, accessToken } = useAuth();
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

  const [activeTab, setActiveTab] = useState('account');
  const [savedDecisions, setSavedDecisions] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedDecisions();
    }
  }, [activeTab, accessToken]);

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

  const handleBookmarkToggled = (decisionId, isSaved) => {
    if (!isSaved) {
      setSavedDecisions((prev) => prev.filter((d) => d.id !== decisionId));
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
                <p className="mt-1 text-muted">Manage your account information, topic interests, and saved bookmarks.</p>
              </div>

              <div className="flex items-center gap-1.5 rounded-2xl bg-surface p-1 border border-border-default shadow-xs">
                {[
                  { id: 'account', label: 'Account & Display', icon: '👤' },
                  { id: 'interests', label: 'Topic Interests', icon: '🏷️' },
                  { id: 'saved', label: 'Saved Decisions', icon: '🔖' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
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
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {user.role || 'USER'}
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

          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
