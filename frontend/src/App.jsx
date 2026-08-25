import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageTransition from './components/PageTransition';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingWizard from './pages/OnboardingWizard';
import DashboardPage from './pages/DashboardPage';
import CreateDecision from './pages/CreateDecision';
import DecisionDetails from './pages/DecisionDetails';
import EditDecision from './pages/EditDecision';
import VotePage from './pages/VotePage';
import AnalysisPage from './pages/AnalysisPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Profile from './pages/Profile';
import AdminPage from './pages/AdminPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CreateCommunity from './pages/CreateCommunity';
import CommunityDetails from './pages/CommunityDetails';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ContactSupport from './pages/ContactSupport';
import NotFound from './pages/NotFound';

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        {/* Public auth routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Onboarding Wizard */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decisions/create"
          element={
            <ProtectedRoute>
              <CreateDecision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decisions/:id"
          element={
            <ProtectedRoute>
              <DecisionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decisions/:id/edit"
          element={
            <ProtectedRoute>
              <EditDecision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decisions/:id/vote"
          element={
            <ProtectedRoute>
              <VotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/create"
          element={
            <ProtectedRoute>
              <CreateCommunity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/:id"
          element={
            <ProtectedRoute>
              <CommunityDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms-conditions"
          element={
            <ProtectedRoute>
              <TermsConditions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-support"
          element={
            <ProtectedRoute>
              <ContactSupport />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
