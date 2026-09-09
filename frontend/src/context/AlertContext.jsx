/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: AlertContext.jsx
 * Architecture Tier: State Management Context (State Layer)
 * Path: frontend/src/context/AlertContext.jsx
 *
 * Purpose:
 *   React Context provider managing global alert modals, confirmation prompts, and user notification dialogs.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AlertPopup from '../components/AlertPopup';
import { getUserFriendlyError } from '../utils/errorMessages';

const AlertContext = createContext(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

// Global emitter for triggering alerts outside React components
export const GLOBAL_ALERT_EVENT = 'app:global-alert';

export function triggerGlobalError(error, fallbackMessage) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(GLOBAL_ALERT_EVENT, {
        detail: { error, fallbackMessage },
      })
    );
  }
}

export function triggerGlobalAlert(title, message) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(GLOBAL_ALERT_EVENT, {
        detail: { title, message },
      })
    );
  }
}

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'error', // 'error' | 'confirm' | 'info'
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    isDangerous: false,
  });

  const confirmResolverRef = useRef(null);
  const lastAlertRef = useRef({ message: '', time: 0 });

  const closeAlert = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCancel = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((title = 'Notice', message = '') => {
    const now = Date.now();
    // Prevent duplicate popups within 1.5 seconds if message is the same
    if (
      lastAlertRef.current.message === message &&
      now - lastAlertRef.current.time < 1500
    ) {
      return;
    }

    lastAlertRef.current = { message, time: now };
    setAlertState({
      isOpen: true,
      type: 'info',
      title: title || 'Notice',
      message: message || 'An unexpected event occurred.',
      confirmText: 'OK',
      cancelText: 'Cancel',
      isDangerous: false,
    });
  }, []);

  const showError = useCallback(
    (error, fallbackMessage) => {
      const { title, message } = getUserFriendlyError(error, fallbackMessage);
      const now = Date.now();
      if (
        lastAlertRef.current.message === message &&
        now - lastAlertRef.current.time < 1500
      ) {
        return;
      }
      lastAlertRef.current = { message, time: now };

      setAlertState({
        isOpen: true,
        type: 'error',
        title,
        message,
        confirmText: 'OK',
        cancelText: 'Cancel',
        isDangerous: false,
      });
    },
    []
  );

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;

      let title = 'Confirm Action';
      let message = '';
      let confirmText = 'OK';
      let cancelText = 'Cancel';
      let isDangerous = false;

      if (typeof options === 'string') {
        message = options;
      } else if (options && typeof options === 'object') {
        title = options.title || title;
        message = options.message || '';
        confirmText = options.confirmText || confirmText;
        cancelText = options.cancelText || cancelText;
        isDangerous = Boolean(options.isDangerous);
      }

      setAlertState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        isDangerous,
      });
    });
  }, []);

  // Intercept window.alert so no browser dialog can appear
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (msg) => {
        showAlert('Notice', String(msg || ''));
      };
      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showAlert]);

  // Global event listener for errors triggered outside React components
  useEffect(() => {
    const handleGlobalAlert = (event) => {
      const { error, fallbackMessage, title, message } = event.detail || {};
      if (title || message) {
        showAlert(title, message);
      } else if (error) {
        showError(error, fallbackMessage);
      }
    };

    window.addEventListener(GLOBAL_ALERT_EVENT, handleGlobalAlert);
    return () => {
      window.removeEventListener(GLOBAL_ALERT_EVENT, handleGlobalAlert);
    };
  }, [showAlert, showError]);

  // Global unhandled rejection fallback
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (event.reason) {
        showError(event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [showError]);

  return (
    <AlertContext.Provider value={{ showAlert, showError, showConfirm, confirm: showConfirm, closeAlert }}>
      {children}
      <AlertPopup
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        isDangerous={alertState.isDangerous}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
}

export default AlertProvider;
