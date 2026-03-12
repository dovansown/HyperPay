import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

type AdminLayoutProps = {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation()
  const role = useAppSelector((s) => s.auth.user?.role)

  const systemLinks = [
    { to: '/admin/users', icon: 'group', label: t('admin.nav.users', 'Users') },
    { to: '/admin/plans', icon: 'inventory_2', label: t('admin.nav.plans', 'Plans') },
    { to: '/admin/user-packages', icon: 'deployed_code', label: t('admin.nav.userPackages', 'User Packages') },
    { to: '/admin/banks', icon: 'account_balance', label: t('admin.nav.banks', 'Banks') },
  ] as const
  const contentLinks = [
    { to: '/admin/blog', icon: 'article', label: t('admin.nav.blog', 'Blog') },
    { to: '/admin/categories', icon: 'category', label: t('admin.nav.categories', 'Categories') },
    { to: '/admin/tags', icon: 'sell', label: t('admin.nav.tags', 'Tags') },
  ] as const

  const links = [...(role === 'ADMIN' ? systemLinks : []), ...contentLinks]

  return (
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
      <aside className="w-full lg:w-64 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-slate-900 text-sm font-bold">{t('admin.sidebar.title', 'Admin')}</h1>
            <p className="text-slate-500 text-xs">
              {t('admin.sidebar.subtitle', 'System and content management')}
            </p>
          </div>
        </div>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>
      <div className="flex-1 min-w-0 w-full flex flex-col gap-8">{children}</div>
    </section>
  )
}

