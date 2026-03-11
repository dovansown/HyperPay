import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { forgotPasswordThunk } from '../../store/authSlice'
import { AuthLayout } from './AuthLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    try {
      await dispatch(forgotPasswordThunk({ email })).unwrap()
      setSent(true)
    } catch {
      setSent(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <Card className="shadow-xl shadow-primary/5 border border-slate-200/60">
          <CardBody className="p-8">
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
              </div>
              <h1 className="text-2xl font-medium text-slate-900">
                {t('auth.forgot.title', 'Forgot password?')}
              </h1>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                {t(
                  'auth.forgot.subtitle',
                  "Enter the email address associated with your account and we'll send you a link to reset your password.",
                )}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label={t('auth.email', 'Email address')}
                placeholder={t('auth.emailPlaceholder', 'name@company.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {sent && !error && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
                  {t('auth.forgot.success', 'Reset link has been sent to your email.')}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {loading
                  ? t('auth.forgot.loading', 'Sending...')
                  : t('auth.forgot.submit', 'Send reset link')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                {t('auth.forgot.back', 'Back to sign in')}
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          © 2024 HyperPay Inc.
          <span className="mx-1.5">·</span>
          <a className="hover:underline" href="#">
            {t('auth.forgot.privacy', 'Privacy')}
          </a>
          <span className="mx-1.5">·</span>
          <a className="hover:underline" href="#">
            {t('auth.forgot.terms', 'Terms')}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

