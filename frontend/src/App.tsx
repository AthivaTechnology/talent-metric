import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import Layout from '@components/layout/Layout';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import LoadingSpinner from '@components/common/LoadingSpinner';

// Pages
import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import AppraisalsPage from '@pages/AppraisalsPage';
import AppraisalDetailPage from '@pages/AppraisalDetailPage';
import UsersPage from '@pages/UsersPage';
import ProfilePage from '@pages/ProfilePage';
import TeamPage from '@pages/TeamPage';
import AnalyticsPage from '@pages/AnalyticsPage';
import UserManualPage from '@pages/UserManualPage';
import PeerFeedbackPage from '@pages/PeerFeedbackPage';

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Initializing..." />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — layout wrapper */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appraisals" element={<AppraisalsPage />} />
        <Route path="/appraisals/:id" element={<AppraisalDetailPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={['manager', 'tech_lead']}>
              <TeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'tech_lead']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/peer-feedback" element={<PeerFeedbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user-manual" element={<UserManualPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
