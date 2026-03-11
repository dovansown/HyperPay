import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginThunk } from '../../store/authSlice'
import { AuthLayout } from './AuthLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'

type LocationState = {
  from?: { pathname: string }
}

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    try {
      await dispatch(loginThunk({ email, password })).unwrap()
      const state = location.state as LocationState | null
      const redirectTo = state?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch {
      // handled via slice
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <Card>
          <CardBody className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-slate-900 text-xl font-medium mb-2">
                {t('auth.login.title', 'Sign in to your account')}
              </h2>
              <p className="text-slate-custom text-sm">
                {t(
                  'auth.login.subtitle',
                  'Welcome back. Please enter your details to continue.',
                )}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                label={t('auth.email', 'Email address')}
                placeholder={t('auth.emailPlaceholder', 'name@company.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                label={t('auth.password', 'Password')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs text-slate-600">
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  label={t('auth.login.remember', 'Remember me')}
                />
                <Link
                  to="/forgot-password"
                  className="text-primary font-medium hover:underline"
                >
                  {t('auth.login.forgot', 'Forgot password?')}
                </Link>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {loading
                  ? t('auth.login.loading', 'Signing in...')
                  : t('common.signIn')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-600">
                {t('auth.login.noAccount', "Don't have an account?")}{' '}
                <Link
                  to="/register"
                  className="text-primary font-medium hover:underline"
                >
                  {t('common.createAccount')}
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </AuthLayout>
  )
}

