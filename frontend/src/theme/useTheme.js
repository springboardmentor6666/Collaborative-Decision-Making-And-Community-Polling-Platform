/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: useTheme.js
 * Architecture Tier: Theme & Styling System (Presentation Layer)
 * Path: frontend/src/theme/useTheme.js
 *
 * Purpose:
 *   Custom React hook exposing the current theme state and theme switching dispatchers.
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
