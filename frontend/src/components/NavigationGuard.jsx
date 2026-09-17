/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: NavigationGuard.jsx
 * Architecture Tier: Reusable Security / Navigation Component (UI Layer)
 * Path: frontend/src/components/NavigationGuard.jsx
 *
 * Purpose:
 *   Intercepts browser back-button navigation that would exit the authenticated
 *   application area (e.g. returning to /login, /signup, or exiting the session)
 *   and presents a confirmation dialog to prevent accidental sign-outs.
 */

import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]);

export default function NavigationGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showConfirm } = useAlert();

  const isConfirmingRef = useRef(false);
  const currentPathRef = useRef(location.pathname);
  const isGuardedRef = useRef(false);

  // Keep track of the current authenticated path
  useEffect(() => {
    if (user && !PUBLIC_ROUTES.has(location.pathname)) {
      currentPathRef.current = location.pathname;
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (!user) return;

    // If starting on an authenticated route at the root of browser history,
    // establish a sentinel history state to catch back button before leaving the site.
    if (!isGuardedRef.current && !PUBLIC_ROUTES.has(location.pathname)) {
      if (!window.history.state || window.history.state.key === 'default' || !window.history.state.__dh_auth) {
        window.history.pushState(
          { ...window.history.state, __dh_auth: true, path: location.pathname },
          '',
          window.location.href
        );
      }
      isGuardedRef.current = true;
    }

    const handlePopState = async (event) => {
      if (!user) return;

      const targetPath = window.location.pathname;
      const isPublicTarget = PUBLIC_ROUTES.has(targetPath);
      const isPoppedToBoundary = !event.state || (!event.state.__dh_auth && targetPath === currentPathRef.current);

      if ((isPublicTarget || isPoppedToBoundary) && !isConfirmingRef.current) {
        isConfirmingRef.current = true;

        // Keep browser URL anchored on the authenticated page while dialog is displayed
        window.history.pushState(
          { ...event.state, __dh_auth: true, path: currentPathRef.current },
          '',
          currentPathRef.current
        );

        try {
          const confirmed = await showConfirm({
            title: 'Leave DecisionHub?',
            message: 'You are currently signed in. Are you sure you want to log out and return to the sign-in page?',
            confirmText: 'Log Out & Leave',
            cancelText: 'Stay Signed In',
            isDangerous: true,
          });

          if (confirmed) {
            await logout();
            navigate('/login', { replace: true });
          }
        } finally {
          isConfirmingRef.current = false;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, logout, navigate, showConfirm, location.pathname]);

  return children;
}
