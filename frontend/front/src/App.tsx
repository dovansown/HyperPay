import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import TeamRolesPage from './pages/TeamRolesPage'
import BanksPage from './pages/BanksPage'
import ApiKeysWebhookPage from './pages/ApiKeysWebhookPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage'
import ActivityLogsPage from './pages/settings/ActivityLogsPage'
import PlanBillingPage from './pages/settings/PlanBillingPage'
import ExportDataPage from './pages/settings/ExportDataPage'
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team/roles" element={<TeamRolesPage />} />
        <Route path="/banks" element={<BanksPage />} />
        <Route path="/apis" element={<ApiKeysWebhookPage />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="logs" element={<ActivityLogsPage />} />
          <Route path="plan" element={<PlanBillingPage />} />
          <Route path="export" element={<ExportDataPage />} />
          <Route path="notifications" element={<NotificationSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
