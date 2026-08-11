import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, googleLoginApi, logoutApi, refreshSessionApi } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * On initial mount / refresh: execute silent refresh call to restore session
   * using secure short-lived in-memory access token strategy.
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

        if (storedToken && storedUser) {
          if (isMounted) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
          return;
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

    return () => {
      isMounted = false;
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
