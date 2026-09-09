/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: AdminRoute.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/AdminRoute.jsx
 *
 * Purpose:
 *   Role-based route guard component ensuring only authenticated users with ADMIN authority can access protected admin routes.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader message="Verifying administrator permissions..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toUpperCase();
  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
