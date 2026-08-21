import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./context/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LandingPage from "./landingpage"; // The legacy landing page, which will probably need refactoring later

import CommunityList from "./modules/communities/pages/CommunityList";
import MyCommunities from "./modules/communities/pages/MyCommunities";
import CommunityDetails from "./modules/communities/pages/CommunityDetails";
import CreateCommunity from "./modules/communities/pages/CreateCommunity";
import EditCommunity from "./modules/communities/pages/EditCommunity";
import Members from "./modules/communities/pages/Members";
import CommunityAdminDashboard from "./modules/communities/pages/CommunityAdminDashboard";

import ElectionDetails from "./modules/elections/pages/ElectionDetails";
import ElectionManagementDashboard from "./modules/elections/pages/ElectionManagementDashboard";
import DecisionFeed from "./modules/decisions/pages/DecisionFeed";
import MyDecisions from "./modules/decisions/pages/MyDecisions";
import CreateDecision from "./modules/decisions/pages/CreateDecision";
import EditDecision from "./modules/decisions/pages/EditDecision";
import DecisionDetails from "./modules/decisions/pages/DecisionDetails";
import MyVotes from "./modules/voting/pages/MyVotes";

import { AnalyticsDashboardPage } from './modules/analytics/pages/AnalyticsDashboardPage';
import { CommunityAnalyticsPage } from './modules/analytics/pages/CommunityAnalyticsPage';
import { DecisionAnalyticsPage } from './modules/analytics/pages/DecisionAnalyticsPage';
import NotificationsPage from "./modules/notifications/pages/NotificationsPage";
import ActivityTimelinePage from "./modules/notifications/pages/ActivityTimelinePage";

import { ProfilePage } from "./modules/profile/pages/ProfilePage";
import { EditProfilePage } from "./modules/profile/pages/EditProfilePage";
import { SettingsPage } from "./modules/profile/pages/SettingsPage";
import { SavedDecisionsPage } from "./modules/profile/pages/SavedDecisionsPage";
import { SystemAdminDashboard } from "./modules/admin/pages/SystemAdminDashboard";
import { UserManagementPage } from "./modules/admin/pages/UserManagementPage";
import { AuditLogsPage } from "./modules/admin/pages/AuditLogsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/communities" element={<CommunityList />} />
        <Route path="/communities/my" element={<MyCommunities />} />
        <Route path="/communities/new" element={<CreateCommunity />} />
        <Route path="/communities/:id" element={<CommunityDetails />} />
        <Route path="/communities/:id/edit" element={<EditCommunity />} />
        <Route path="/communities/:id/members" element={<Members />} />
        <Route path="/communities/:id/admin" element={<CommunityAdminDashboard />} />
        <Route path="/communities/:id/admin/elections/:eventId" element={<ElectionManagementDashboard />} />
        <Route path="/communities/:id/elections/:eventId" element={<ElectionDetails />} />
        
        <Route path="/decisions" element={<DecisionFeed />} />
        <Route path="/decisions/my" element={<MyDecisions />} />
        <Route path="/decisions/saved" element={<SavedDecisionsPage />} />
        <Route path="/decisions/new" element={<CreateDecision />} />
        <Route path="/decisions/:id" element={<DecisionDetails />} />
        <Route path="/decisions/:id/edit" element={<EditDecision />} />
        <Route path="/votes/my" element={<MyVotes />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="analytics/community/:id" element={<CommunityAnalyticsPage />} />
        <Route path="analytics/decision/:id" element={<DecisionAnalyticsPage />} />
        <Route path="/activity" element={<ActivityTimelinePage />} />
        <Route path="/reports" element={<div className="p-4">Reports Page (WIP)</div>} />
        
        {/* Profile & Settings */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/saved" element={<SavedDecisionsPage />} />

        {/* System Admin */}
        <Route path="/admin" element={<SystemAdminDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
}
