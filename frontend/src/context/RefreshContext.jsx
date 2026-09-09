/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: RefreshContext.jsx
 * Architecture Tier: State Management Context (State Layer)
 * Path: frontend/src/context/RefreshContext.jsx
 *
 * Purpose:
 *   React Context provider facilitating coordinated cross-component state refetches without full page reloads.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const RefreshContext = createContext({
  refreshKey: 0,
  isRefreshing: false,
  triggerRefresh: () => {},
});

export function RefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    // Broadcast event for components that listen directly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('decisionhub:refresh', { detail: { timestamp: Date.now() } }));
    }

    // Reset spinning indicator smoothly after animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshKey, isRefreshing, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    return { refreshKey: 0, isRefreshing: false, triggerRefresh: () => {} };
  }
  return context;
}

export default RefreshContext;
