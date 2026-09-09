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

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-secondary">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
