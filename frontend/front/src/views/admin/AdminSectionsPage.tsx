import React from 'react'
import { Navigate } from 'react-router-dom'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { AdminLayout } from './AdminLayout'
import { SystemAdminPage } from './SystemAdminPage'
import { ContentAdminPage } from '../content/ContentAdminPage'
import { useAppSelector } from '../../store/hooks'

export const AdminEntryPage: React.FC = () => {
  const role = useAppSelector((s) => s.auth.user?.role)
  if (role === 'ADMIN') return <Navigate to="/admin/users" replace />
  return <Navigate to="/admin/blog" replace />
}

export const AdminUsersPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="users" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminPlansPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="packages" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminBanksPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="banks" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminDurationsPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="durations" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminUserPackagesPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="user-packages" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminBlogPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <ContentAdminPage section="blog" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminCategoriesPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <ContentAdminPage section="categories" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminTagsPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <ContentAdminPage section="tags" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

export const AdminSystemSettingsPage: React.FC = () => (
  <AuthenticatedLayout>
    <AdminLayout>
      <SystemAdminPage section="system-settings" embedded />
    </AdminLayout>
  </AuthenticatedLayout>
)

