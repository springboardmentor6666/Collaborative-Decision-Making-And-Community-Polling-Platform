/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: AuthContext.jsx
 * Architecture Tier: State Management Context (State Layer)
 * Path: frontend/src/context/AuthContext.jsx
 *
 * Purpose:
 *   React Context provider managing global authentication state, JWT session storage, login/logout actions, and Google OAuth.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  googleLoginApi,
  logoutApi,
  refreshSessionApi,
  getCurrentUserApi,
} from '../api/axiosClient';

function isJwtExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return false;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * On initial mount / refresh: execute silent refresh or restore session
   */
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromQuery = params.get('token');
        const providerFromQuery = params.get('provider');
        const emailFromQuery = params.get('email');
        const nameFromQuery = params.get('name');
        const avatarFromQuery = params.get('avatar');

        if (tokenFromQuery) {
          const userData = {
            id: params.get('id') || `${providerFromQuery || 'oauth'}_user`,
            email: emailFromQuery || 'oauth@example.com',
            name: nameFromQuery || emailFromQuery || 'OAuth User',
            avatar: avatarFromQuery || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailFromQuery || 'oauth')}`,
          };

          if (isMounted) {
            setAccessToken(tokenFromQuery);
            setUser(userData);
            if (typeof window !== 'undefined') {
              localStorage.setItem('decisionhub_token', tokenFromQuery);
              localStorage.setItem('decisionhub_user', JSON.stringify(userData));
            }
            window.history.replaceState({}, '', '/dashboard');
            window.location.assign('/dashboard');
          }
          return;
        }

        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('decisionhub_user') : null;

        if (storedToken && !isJwtExpired(storedToken)) {
          if (isMounted) {
            setAccessToken(storedToken);
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (e) {
                // Ignore parse error
              }
            }
          }

          // Fetch fresh user profile in background to keep permissions & data strictly synced
          try {
            const freshUser = await getCurrentUserApi(storedToken);
            if (isMounted && freshUser) {
              setUser(freshUser);
              if (typeof window !== 'undefined') {
                localStorage.setItem('decisionhub_user', JSON.stringify(freshUser));
              }
            }
          } catch (fetchErr) {
            // If token is rejected by backend (401), clear expired session
            if (fetchErr.status === 401) {
              if (isMounted) {
                setAccessToken(null);
                setUser(null);
              }
              if (typeof window !== 'undefined') {
                localStorage.removeItem('decisionhub_token');
                localStorage.removeItem('decisionhub_user');
              }
            }
          }
          return;
        } else if (storedToken && isJwtExpired(storedToken)) {
          // Token expired: clean up
          if (typeof window !== 'undefined') {
            localStorage.removeItem('decisionhub_token');
            localStorage.removeItem('decisionhub_user');
          }
        }

        const { accessToken: newToken, user: userData } = await refreshSessionApi();
        if (isMounted) {
          setAccessToken(newToken);
          setUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen for global session expiry from API responses
    const handleSessionExpired = () => {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('decisionhub_token');
        localStorage.removeItem('decisionhub_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
          window.location.assign('/login?expired=true');
        }
      }
    };

    window.addEventListener('decisionhub:session-expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('decisionhub:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { accessToken: newToken, user: userData } = await loginApi(email, password);
      setAccessToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.message || 'Failed to sign in. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Register new user account
   */
  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const { accessToken: newToken, user: userData } = await registerApi(name, email, password);
      setAccessToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const { accessToken: newToken, user: userData } = await googleLoginApi();
      setAccessToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.message || 'Failed to sign in with Google.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(async () => {
    setError(null);
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('decisionhub_token');
        localStorage.removeItem('decisionhub_user');
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('decisionhub_user', JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  const value = {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
