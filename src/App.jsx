import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import DashboardPage from './pages/DashboardPage'
import WorkgroupsPage from './pages/WorkgroupsPage'
import WorkgroupDetailPage from './pages/WorkgroupDetailPage'
import PlanBoardPage from './pages/PlanBoardPage'
import ProfilePage from './pages/ProfilePage'
import { Toast } from './components/shared/Toast'
import { useAuth } from './hooks/useAuth'

function RootRedirect() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workgroups" element={<WorkgroupsPage />} />
                <Route path="/workgroups/:id" element={<WorkgroupDetailPage />} />
                <Route path="/plans/:id" element={<PlanBoardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
