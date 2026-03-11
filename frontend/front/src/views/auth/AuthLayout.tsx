import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type AuthLayoutProps = {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="bg-background-light min-h-screen font-sans flex flex-col">
      <header className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            className="flex items-center gap-2 text-slate-800"
            onClick={() => navigate('/')}
          >
            <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">bolt</span>
            </div>
            <span className="text-base font-black tracking-tight">HyperPay</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-sm">home</span>
            {t('auth.backHome', 'Back to homepage')}
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}

