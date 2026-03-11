import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

type LandingHeaderProps = {
  variant?: 'landing' | 'public'
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ variant = 'landing' }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.token))

  const currentLanguage = i18n.language.startsWith('vi') ? 'vi' : 'en'

  const handleChangeLanguage = (lng: 'vi' | 'en') => {
    void i18n.changeLanguage(lng)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <button type="button" className="flex items-center gap-2" onClick={() => navigate('/')}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">HyperPay</span>
          </button>

          <div className="hidden lg:flex items-center gap-7">
            <div className="group relative py-4 cursor-pointer">
              <span className="text-sm font-medium text-slate-custom flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                {t('nav.products')}{' '}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </span>
              <div className="absolute top-full left-0 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-100 p-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: 'payments',
                      titleKey: 'landing.products.payments.title',
                      descKey: 'landing.products.payments.desc',
                    },
                    {
                      icon: 'sync',
                      titleKey: 'landing.products.billing.title',
                      descKey: 'landing.products.billing.desc',
                    },
                    {
                      icon: 'account_balance',
                      titleKey: 'landing.products.treasury.title',
                      descKey: 'landing.products.treasury.desc',
                    },
                    {
                      icon: 'security',
                      titleKey: 'landing.products.radar.title',
                      descKey: 'landing.products.radar.desc',
                    },
                  ].map((item) => (
                    <div
                      key={item.titleKey}
                      className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{t(item.titleKey)}</p>
                        <p className="text-xs text-slate-custom mt-1">{t(item.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {variant === 'public' && (
              <>
                <NavLink
                  to="/docs"
                  className={({ isActive }) =>
                    [
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-slate-custom hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {t('public.nav.docs', 'Docs')}
                </NavLink>
                <NavLink
                  to="/help"
                  className={({ isActive }) =>
                    [
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-slate-custom hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {t('public.nav.help', 'Help')}
                </NavLink>
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    [
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-slate-custom hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {t('public.nav.blog', 'Blog')}
                </NavLink>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleChangeLanguage('en')}
              className={`px-2 py-1 rounded-full transition-colors ${
                currentLanguage === 'en' ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleChangeLanguage('vi')}
              className={`px-2 py-1 rounded-full transition-colors ${
                currentLanguage === 'vi' ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VI
            </button>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 min-w-[160px] text-center"
            >
              {t('common.dashboard')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-slate-custom hover:text-slate-900 min-w-[96px] text-center"
              >
                {t('common.signIn')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 min-w-[112px] text-center"
              >
                {t('common.startNow')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

