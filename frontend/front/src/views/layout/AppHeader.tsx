import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/authSlice'

export const AppHeader: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [open, setOpen] = useState(false)

  const currentLanguage = i18n.language.startsWith('vi') ? 'vi' : 'en'

  const handleLogout = () => {
    dispatch(logout())
    setOpen(false)
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-3">
      <div className="flex items-center gap-3 text-primary">
        <div className="size-6">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-slate-900 text-lg font-black leading-tight tracking-[-0.015em]">
          HyperPay
        </h2>
      </div>

      <div className="flex flex-1 justify-end gap-8 items-center">
        <nav className="hidden md:flex items-center gap-8">
          {[
            { to: '/dashboard', label: t('app.nav.dashboard', 'Dashboard') },
            { to: '/bank-accounts', label: t('app.nav.banking', 'Banking') },
            { to: '/transactions', label: t('app.nav.transactions', 'Transactions') },
            { to: '/billing', label: t('app.nav.billing', 'Billing') },
            { to: '/webhooks', label: t('app.nav.webhooks', 'Webhooks') },
            {
              to: '/admin',
              label: t('app.nav.admin', 'Admin'),
              visible: ['EDITOR', 'ADMIN'].includes(user?.role ?? ''),
            },
            { to: '/docs', label: t('app.nav.docs', 'Docs') },
          ]
            .filter((item) => item.visible ?? true)
            .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'text-sm font-medium transition-colors pb-1',
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:text-primary border-b-2 border-transparent',
                ].join(' ')
              }
              end={item.to === '/dashboard'}
            >
              {item.label}
            </NavLink>
            ))}
        </nav>
        <div className="hidden sm:flex items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              currentLanguage === 'en'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('vi')}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              currentLanguage === 'vi'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            VI
          </button>
        </div>
        <div className="relative flex gap-2">
          <button
            type="button"
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </button>
          {open && (
            <div className="absolute right-0 top-11 mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2 text-sm">
              <div className="px-3 pb-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400">
                  {t('app.user.signedInAs', 'Signed in as')}
                </p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.fullName ?? user?.email ?? '—'}
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                )}
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                onClick={() => {
                  setOpen(false)
                  navigate('/settings/profile')
                }}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>{t('app.user.profile', 'Profile')}</span>
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-red-600"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>{t('app.user.logout', 'Sign out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

