import React from 'react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'

export const VerifyPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">stay_primary_portrait</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {t('verify.title', 'Verify your identity')}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              {t(
                'verify.description',
                "We've sent a verification link to your email. Please check your inbox and follow the instructions to continue.",
              )}
            </p>
          </div>

          <div className="space-y-4">
            <Button className="w-full">
              {t('verify.primaryCta', 'Open email app')}
            </Button>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                {t('verify.resend', "Didn't receive anything? Resend email")}
              </button>
              <button
                type="button"
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                {t('verify.otherMethod', 'Use another verification method')}
              </button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span className="text-[11px] uppercase tracking-widest font-semibold">
                {t('verify.secure', 'Secure Encryption Enabled')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

