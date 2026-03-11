import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '../views/landing/LandingPage'
import { LoginPage } from '../views/auth/LoginPage'
import { RegisterPage } from '../views/auth/RegisterPage'
import { ForgotPasswordPage } from '../views/auth/ForgotPasswordPage'
import { VerifyPage } from '../views/auth/VerifyPage'
import { DashboardPage } from '../views/dashboard/DashboardPage'
import { NotFoundPage } from '../views/errors/NotFoundPage'
import { withAuth } from '../views/layout/withAuth'
import { BanksPage } from '../views/banks/BanksPage'
import { WebhookPage } from '../views/webhook/WebhookPage'
import { WebhookListPage } from '../views/webhook/WebhookListPage'
import { BillingPage } from '../views/billing/BillingPage'
import { ProfileSettingsPage } from '../views/settings/ProfileSettingsPage'
import { NotificationSettingsPage } from '../views/settings/NotificationSettingsPage'
import { SecuritySettingsPage } from '../views/settings/SecuritySettingsPage'
import { DocsPage } from '../views/docs/DocsPage'
import { HelpPage } from '../views/help/HelpPage'
import { BlogPage } from '../views/blog/BlogPage'
import { BlogPostPage } from '../views/blog/BlogPostPage'

const ProtectedDashboard = withAuth(DashboardPage)
const ProtectedBanks = withAuth(BanksPage)
const ProtectedWebhook = withAuth(WebhookPage)
const ProtectedWebhookList = withAuth(WebhookListPage)
const ProtectedBilling = withAuth(BillingPage)
const ProtectedSettingsProfile = withAuth(ProfileSettingsPage)
const ProtectedSettingsNotifications = withAuth(NotificationSettingsPage)
const ProtectedSettingsSecurity = withAuth(SecuritySettingsPage)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/verify',
    element: <VerifyPage />,
  },
  {
    path: '/docs',
    element: <DocsPage />,
  },
  {
    path: '/help',
    element: <HelpPage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:slug',
    element: <BlogPostPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedDashboard />,
  },
  {
    path: '/bank-accounts',
    element: <ProtectedBanks />,
  },
  {
    path: '/billing',
    element: <ProtectedBilling />,
  },
  {
    path: '/webhooks',
    element: <ProtectedWebhookList />,
  },
  {
    path: '/webhooks/new',
    element: <ProtectedWebhook />,
  },
  {
    path: '/settings/profile',
    element: <ProtectedSettingsProfile />,
  },
  {
    path: '/settings/notifications',
    element: <ProtectedSettingsNotifications />,
  },
  {
    path: '/settings/security',
    element: <ProtectedSettingsSecurity />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

