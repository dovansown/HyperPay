import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '../views/landing/LandingPage'
import { LoginPage } from '../views/auth/LoginPage'
import { RegisterPage } from '../views/auth/RegisterPage'
import { ForgotPasswordPage } from '../views/auth/ForgotPasswordPage'
import { VerifyPage } from '../views/auth/VerifyPage'
import { DashboardPage } from '../views/dashboard/DashboardPage'
import { NotFoundPage } from '../views/errors/NotFoundPage'
import { withAuth } from '../views/layout/withAuth'
import { withRole } from '../views/layout/withRole'
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
import { TransactionsPage } from '../views/transactions/TransactionsPage'
import { TransactionDetailPage } from '../views/transactions/TransactionDetailPage'
import { ContentPreviewPage } from '../views/content/ContentPreviewPage'
import {
  AdminBlogPage,
  AdminCategoriesPage,
  AdminEntryPage,
  AdminBanksPage,
  AdminPlansPage,
  AdminTagsPage,
  AdminDurationsPage,
  AdminUserPackagesPage,
  AdminUsersPage,
  AdminSystemSettingsPage,
} from '../views/admin/AdminSectionsPage'

const ProtectedDashboard = withAuth(DashboardPage)
const ProtectedBanks = withAuth(BanksPage)
const ProtectedWebhook = withAuth(WebhookPage)
const ProtectedWebhookList = withAuth(WebhookListPage)
const ProtectedBilling = withAuth(BillingPage)
const ProtectedSettingsProfile = withAuth(ProfileSettingsPage)
const ProtectedSettingsNotifications = withAuth(NotificationSettingsPage)
const ProtectedSettingsSecurity = withAuth(SecuritySettingsPage)
const ProtectedTransactions = withAuth(TransactionsPage)
const ProtectedTransactionDetail = withAuth(TransactionDetailPage)
const ProtectedAdminUsers = withRole(AdminUsersPage, ['ADMIN'])
const ProtectedAdminPlans = withRole(AdminPlansPage, ['ADMIN'])
const ProtectedAdminBanks = withRole(AdminBanksPage, ['ADMIN'])
const ProtectedAdminDurations = withRole(AdminDurationsPage, ['ADMIN'])
const ProtectedAdminUserPackages = withRole(AdminUserPackagesPage, ['ADMIN'])
const ProtectedAdminBlog = withRole(AdminBlogPage, ['EDITOR', 'ADMIN'])
const ProtectedAdminCategories = withRole(AdminCategoriesPage, ['EDITOR', 'ADMIN'])
const ProtectedAdminTags = withRole(AdminTagsPage, ['EDITOR', 'ADMIN'])
const ProtectedAdminSystemSettings = withRole(AdminSystemSettingsPage, ['ADMIN'])
const ProtectedAdminEntry = withRole(AdminEntryPage, ['EDITOR', 'ADMIN'])

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
    path: '/preview/:token',
    element: <ContentPreviewPage />,
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
    path: '/transactions',
    element: <ProtectedTransactions />,
  },
  {
    path: '/transactions/:id',
    element: <ProtectedTransactionDetail />,
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
    path: '/admin',
    element: <ProtectedAdminEntry />,
  },
  {
    path: '/admin/users',
    element: <ProtectedAdminUsers />,
  },
  {
    path: '/admin/plans',
    element: <ProtectedAdminPlans />,
  },
  {
    path: '/admin/banks',
    element: <ProtectedAdminBanks />,
  },
  {
    path: '/admin/durations',
    element: <ProtectedAdminDurations />,
  },
  {
    path: '/admin/user-packages',
    element: <ProtectedAdminUserPackages />,
  },
  {
    path: '/admin/blog',
    element: <ProtectedAdminBlog />,
  },
  {
    path: '/admin/categories',
    element: <ProtectedAdminCategories />,
  },
  {
    path: '/admin/tags',
    element: <ProtectedAdminTags />,
  },
  {
    path: '/admin/system-settings',
    element: <ProtectedAdminSystemSettings />,
  },
  {
    path: '/content-studio',
    element: <ProtectedAdminBlog />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

