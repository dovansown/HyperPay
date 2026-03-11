import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export const PublicHeader: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const currentLanguage = i18n.language.startsWith('vi') ? 'vi' : 'en'

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 px-6 md:px-20 py-4 bg-background-light/80 backdrop-blur-md">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-3"
      >
        <div className="text-primary">
          <svg className="size-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
          </svg>
        </div>
        <h2 className="text-slate-900 text-xl font-bold tracking-tight">HyperPay</h2>
      </button>

      <nav className="hidden md:flex items-center gap-8">
        {[
          { to: '/docs', label: t('public.nav.docs', 'Docs') },
          { to: '/help', label: t('public.nav.help', 'Help') },
          { to: '/blog', label: t('public.nav.blog', 'Blog') },
        ].map((x) => (
          <NavLink
            key={x.to}
            to={x.to}
            className={({ isActive }) =>
              [
                'text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-slate-600 hover:text-primary',
              ].join(' ')
            }
          >
            {x.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3">
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

        <Button variant="ghost" size="md" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
          {t('public.actions.login', 'Log in')}
        </Button>
        <Button size="md" onClick={() => navigate('/register')}>
          {t('public.actions.signup', 'Sign up')}
        </Button>
      </div>
    </header>
  )
}

