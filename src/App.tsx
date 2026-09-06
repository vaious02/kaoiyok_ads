import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import AppLayout from './components/AppLayout'
import ConfigNotice from './components/ConfigNotice'
import Spinner from './components/Spinner'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CampaignsPage from './pages/CampaignsPage'
import MetricsPage from './pages/MetricsPage'
import NewsPage from './pages/NewsPage'
import SettingsPage from './pages/SettingsPage'
import type { ReactElement } from 'react'

function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  if (loading) return <Spinner label="กำลังตรวจสอบการเข้าสู่ระบบ…" />
  if (!session) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuthed({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  if (loading) return <Spinner label="กำลังโหลด…" />
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigNotice />

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
