import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

type SettingsLayoutProps = {
  children: React.ReactNode
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const { t } = useTranslation()

  const links = [
    {
      to: '/settings/profile',
      icon: 'tune',
      label: t('settings.nav.profile', 'Cài đặt'),
    },
    {
      to: '/settings/notifications',
      icon: 'notifications',
      label: t('settings.nav.notifications', 'Notification settings'),
    },
    {
      to: '/settings/security',
      icon: 'lock',
      label: t('settings.nav.security', 'Security'),
    },
  ] as const

  return (
    <section className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
      <aside className="w-full lg:w-64 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <span className="material-symbols-outlined text-primary">settings</span>
          </div>
          <div>
            <h1 className="text-slate-900 text-sm font-bold">
              {t('settings.sidebar.title', 'Settings')}
            </h1>
            <p className="text-slate-500 text-xs">
              {t('settings.sidebar.subtitle', 'Account preferences')}
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
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>
      <div className="flex-1 max-w-4xl flex flex-col gap-8">{children}</div>
    </section>
  )
}

