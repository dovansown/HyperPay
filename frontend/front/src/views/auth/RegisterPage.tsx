import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser, registerThunk } from '../../store/authSlice'
import { AuthLayout } from './AuthLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((s) => s.auth)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [org, setOrg] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms || loading) return
    try {
      await dispatch(registerThunk({ email, password, fullName })).unwrap()
      // Sau khi đăng ký, token đã được lưu -> fetch profile để sync state
      try {
        await dispatch(fetchCurrentUser()).unwrap()
      } catch {
        // ignore, trang verify sẽ tiếp tục dùng token
      }
      navigate('/verify')
    } catch {
      // error handled via slice
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <Card>
          <CardBody className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-slate-900 text-xl font-medium mb-2">
                {t('auth.register.title', 'Create your account')}
              </h2>
              <p className="text-slate-custom text-sm">
                {t(
                  'auth.register.subtitle',
                  'Join thousands of businesses processing payments with HyperPay.',
                )}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                label={t('auth.register.fullName', 'Full name')}
                placeholder={t('auth.register.fullNamePlaceholder', 'Jane Doe')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                id="email"
                type="email"
                autoComplete="email"
                label={t('auth.email', 'Email address')}
                placeholder={t('auth.emailPlaceholder', 'jane@example.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                label={t('auth.password', 'Password')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                id="org"
                type="text"
                autoComplete="organization"
                label={t('auth.register.org', 'Organization name')}
                placeholder={t('auth.register.orgPlaceholder', 'Acme Corp')}
                value={org}
                onChange={(e) => setOrg(e.target.value)}
              />

              <div className="flex items-start gap-3 py-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-500 leading-tight"
                >
                  {t(
                    'auth.register.terms',
                    'I agree to the Terms of Service and Privacy Policy.',
                  )}
                </label>
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
                disabled={!acceptedTerms || loading}
              >
                {loading
                  ? t('auth.register.loading', 'Creating account...')
                  : t('auth.register.submit', 'Create account')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-600">
                {t('auth.register.haveAccount', 'Already have an account?')}{' '}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  {t('common.signIn')}
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </AuthLayout>
  )
}

