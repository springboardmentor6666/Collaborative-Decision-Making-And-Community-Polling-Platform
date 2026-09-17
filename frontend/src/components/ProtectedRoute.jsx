/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ProtectedRoute.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/ProtectedRoute.jsx
 *
 * Purpose:
 *   Route security wrapper redirecting unauthenticated visitors to /login while preserving intended destination route.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import NavigationGuard from './NavigationGuard';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen={true} message="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <NavigationGuard>{children}</NavigationGuard>;
}
