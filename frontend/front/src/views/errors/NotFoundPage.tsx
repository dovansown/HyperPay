import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="font-sans bg-background-light min-h-screen text-slate-900 flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto w-full">
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => navigate('/')}
        >
          <div className="text-primary">
            <svg
              className="size-8"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-slate-900 text-xl font-black tracking-tight">HyperPay</h2>
        </button>
        <button
          type="button"
          className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm hover:brightness-110 transition-all"
          onClick={() => navigate('/login')}
        >
          {t('common.signIn')}
        </button>
      </header>

      <div className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 pointer-events-none" />
        <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-16">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider mb-6">
              {t('errors.notFound.badge', 'Error 404')}
            </div>
            <h1 className="text-slate-900 text-4xl md:text-5xl font-black tracking-tight mb-4">
              {t('errors.notFound.title', 'Page not found')}
            </h1>
            <p className="text-slate-custom text-lg mb-10 leading-relaxed max-w-lg mx-auto">
              {t(
                'errors.notFound.description',
                "The page you are looking for doesn't exist or has been moved. Try searching or use the quick links below.",
              )}
            </p>

            <div className="max-w-lg mx-auto mb-16">
              <label className="relative block group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm"
                  placeholder={t(
                    'errors.notFound.searchPlaceholder',
                    'Search HyperPay help, docs, and more...',
                  )}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-primary mb-4 text-3xl">dashboard</span>
                <h3 className="text-slate-900 font-medium text-base mb-1">
                  {t('errors.notFound.links.dashboard.title', 'Dashboard')}
                </h3>
                <p className="text-slate-custom text-sm">
                  {t(
                    'errors.notFound.links.dashboard.description',
                    'Manage your payments and transactions',
                  )}
                </p>
              </button>
              <a
                href="#"
                className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-primary mb-4 text-3xl">article</span>
                <h3 className="text-slate-900 font-medium text-base mb-1">
                  {t('errors.notFound.links.docs.title', 'Documentation')}
                </h3>
                <p className="text-slate-custom text-sm">
                  {t(
                    'errors.notFound.links.docs.description',
                    'Explore API reference and developer guides',
                  )}
                </p>
              </a>
              <a
                href="#"
                className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-primary mb-4 text-3xl">
                  support_agent
                </span>
                <h3 className="text-slate-900 font-medium text-base mb-1">
                  {t('errors.notFound.links.support.title', 'Support')}
                </h3>
                <p className="text-slate-custom text-sm">
                  {t(
                    'errors.notFound.links.support.description',
                    'Get expert help from our support team',
                  )}
                </p>
              </a>
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-8 px-6 md:px-12 border-t border-slate-200 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              {t('errors.notFound.footer.contact', 'Contact us')}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t('errors.notFound.footer.privacy', 'Privacy Policy')}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t('errors.notFound.footer.status', 'Status')}
            </a>
          </div>
          <p>{t('errors.notFound.footer.copyright', '© 2024 HyperPay. All rights reserved.')}</p>
        </footer>
      </div>
    </div>
  )
}

