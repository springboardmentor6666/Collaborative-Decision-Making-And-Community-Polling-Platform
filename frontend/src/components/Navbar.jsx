import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';

const UI_MODE_COLORS = {
  black: '#0f172a',
  green: '#16a34a',
  saffron: '#f59e0b',
  royal: '#2563eb',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, uiMode, setTheme, setUiMode } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = (path) =>
    `text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-xl ${
      isActive(path) ? 'font-semibold' : ''
    }`;

  const mobileNavLinkClass = (path) =>
    `block w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
      isActive(path)
        ? 'bg-primary-soft text-primary'
        : 'text-text-primary hover:bg-surface-alt'
    }`;

  return (
    <>
      {/* Main navbar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-20 border-b border-border-default backdrop-blur-xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 82%, transparent)', color: 'var(--text-primary)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Left: Hamburger (mobile only) + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-all duration-200 hover:text-text-primary md:hidden"
              aria-label="Open mobile menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 ml-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-app">
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
              <span className="text-lg font-black tracking-tight text-text-primary">DecisionHub</span>
            </Link>
          </div>

          {/* Centre: nav links (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/dashboard"
              className={navLinkClass('/dashboard')}
              style={isActive('/dashboard') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={navLinkClass('/analysis')}
              style={isActive('/analysis') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Analysis
            </Link>
            <Link
              to="/analytics"
              className={navLinkClass('/analytics')}
              style={isActive('/analytics') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Analytics
            </Link>
            <Link
              to="/communities"
              className={navLinkClass('/communities')}
              style={isActive('/communities') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Communities
            </Link>
            <Link
              to="/decisions/create"
              className={navLinkClass('/decisions/create')}
              style={isActive('/decisions/create') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Create
            </Link>
            <Link
              to="/profile"
              className={navLinkClass('/profile')}
              style={isActive('/profile') ? { color: 'var(--primary)', backgroundColor: 'var(--primary-soft)' } : { color: 'var(--text-secondary)' }}
            >
              Profile
            </Link>
          </nav>

          {/* Right: user + logout (desktop only mostly) */}
          <div className="hidden items-center gap-3 md:flex">
            <div
              className="hidden rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] sm:block"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              {theme} · {uiMode}
            </div>

            <div className="flex items-center gap-2.5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.email}
                  className="h-8 w-8 rounded-full bg-primary-soft"
                  style={{ boxShadow: '0 0 0 2px var(--primary-soft)' }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold leading-tight text-text-primary">{user?.name || 'User'}</p>
                <p className="text-xs leading-tight text-muted max-w-[120px] truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-border-default px-3 py-1.5 text-xs font-bold bg-surface text-muted backdrop-blur-sm transition-all duration-200 hover:bg-surface-alt hover:text-text-primary"
            >
              Log Out
            </button>
          </div>
          
          {/* Mobile Profile Icon (Visible when drawer is closed) */}
          <div className="flex md:hidden">
             {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.email}
                  className="h-8 w-8 rounded-full bg-primary-soft"
                  onClick={() => setIsMobileMenuOpen(true)}
                />
              ) : (
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed left-0 top-0 bottom-0 z-50 w-4/5 max-w-sm flex-col overflow-y-auto border-r border-border-default bg-surface p-5 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="font-black">D</span>
                  </div>
                  <span className="font-black text-text-primary">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl p-2 text-muted hover:bg-surface-alt hover:text-text-primary"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border-default bg-surface-alt p-4">
                 {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.email}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="mb-8 flex flex-col gap-2">
                <Link to="/dashboard" className={mobileNavLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/analysis" className={mobileNavLinkClass('/analysis')}>Decision Analysis</Link>
                <Link to="/analytics" className={mobileNavLinkClass('/analytics')}>Creator Analytics</Link>
                <Link to="/communities" className={mobileNavLinkClass('/communities')}>Communities</Link>
                <Link to="/decisions/create" className={mobileNavLinkClass('/decisions/create')}>Create Decision</Link>
                <Link to="/profile" className={mobileNavLinkClass('/profile')}>Profile Settings</Link>
              </nav>

              {/* Theme & UI Mode (Replacing IconSidebar for Mobile) */}
              <div className="mb-6 rounded-2xl border border-border-default p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Theme Settings</p>
                
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {['default', 'light', 'dark'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-xl border py-1.5 text-xs font-bold transition-all ${
                        theme === t
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-border-default bg-surface text-text-primary'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['black', 'green', 'saffron', 'royal'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setUiMode(mode)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-bold transition-all ${
                        uiMode === mode
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-border-default bg-surface text-text-primary'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: UI_MODE_COLORS[mode] }}
                      />
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Log Out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
