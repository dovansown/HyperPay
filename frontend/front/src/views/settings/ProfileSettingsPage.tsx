import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { SettingsLayout } from './SettingsLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { VerificationCodeCard } from '../../components/ui/VerificationCodeCard'
import { useAppSelector } from '../../store/hooks'
import { apiFetch, unwrapApiData } from '../../lib/apiClient'

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
  email_verified?: boolean
}

export const ProfileSettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const token = useAppSelector((s) => s.auth.token)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifySending, setVerifySending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [cpStep, setCpStep] = useState<'form' | 'code'>('form')
  const [cpCurrentPassword, setCpCurrentPassword] = useState('')
  const [cpCode, setCpCode] = useState('')
  const [cpNewPassword, setCpNewPassword] = useState('')
  const [cpConfirmPassword, setCpConfirmPassword] = useState('')
  const [cpVerificationId, setCpVerificationId] = useState('')
  const [cpLoading, setCpLoading] = useState(false)
  const [cpError, setCpError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      const res = await apiFetch<Profile>('/users/me', { token: token ?? undefined })
      const data = unwrapApiData(res)
      setProfile(data)
      setFullName(data.full_name ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchProfile()
  }, [token])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        token: token ?? undefined,
        body: { full_name: fullName },
      })
      await fetchProfile()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSendVerifyEmail = async () => {
    setError(null)
    setVerifySending(true)
    try {
      await apiFetch('/users/me/email/send-verification', {
        method: 'POST',
        token: token ?? undefined,
      })
      setVerifySending(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send verification email')
      setVerifySending(false)
    }
  }

  const handleChangePasswordSendCode = async () => {
    if (cpNewPassword !== cpConfirmPassword) {
      setCpError(t('settings.profile.passwordMismatch', 'Passwords do not match'))
      return
    }
    if (cpNewPassword.length < 6) {
      setCpError(t('settings.profile.passwordMin', 'Password must be at least 6 characters'))
      return
    }
    setCpError(null)
    setCpLoading(true)
    try {
      await apiFetch('/users/me/change-password/check', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          current_password: cpCurrentPassword,
          new_password: cpNewPassword,
        },
      })
      const res = await apiFetch<{ verification_id: string }>('/users/me/change-password/send-code', {
        method: 'POST',
        token: token ?? undefined,
        body: {},
      })
      const data = unwrapApiData(res)
      setCpVerificationId(data.verification_id)
      setCpStep('code')
    } catch (e) {
      setCpError(e instanceof Error ? e.message : 'Failed to send code')
    } finally {
      setCpLoading(false)
    }
  }

  const handleChangePasswordResendCode = async () => {
    setCpError(null)
    setCpLoading(true)
    try {
      const res = await apiFetch<{ verification_id: string }>('/users/me/change-password/send-code', {
        method: 'POST',
        token: token ?? undefined,
        body: {},
      })
      const data = unwrapApiData(res)
      setCpVerificationId(data.verification_id)
    } catch (e) {
      setCpError(e instanceof Error ? e.message : t('settings.profile.resendCodeError', 'Failed to resend code'))
    } finally {
      setCpLoading(false)
    }
  }

  const handleChangePasswordSubmit = async () => {
    if (cpCode.length !== 6) {
      setCpError(t('settings.profile.verificationCodeRequired', 'Enter the 6-digit verification code'))
      return
    }
    setCpError(null)
    setCpLoading(true)
    try {
      await apiFetch('/users/me/change-password', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          verification_id: cpVerificationId,
          code: cpCode,
          current_password: cpCurrentPassword,
          new_password: cpNewPassword,
        },
      })
      setChangePasswordOpen(false)
      setCpStep('form')
      setCpCurrentPassword('')
      setCpCode('')
      setCpNewPassword('')
      setCpConfirmPassword('')
    } catch (e) {
      setCpError(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setCpLoading(false)
    }
  }

  if (loading || !profile) {
    return (
      <AuthenticatedLayout>
        <SettingsLayout>
          <p className="text-slate-500">{t('common.loading', 'Loading...')}</p>
        </SettingsLayout>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <SettingsLayout>
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">
            {t('settings.profile.title', 'Account settings')}
          </h2>
          <p className="text-slate-custom text-sm">
            {t(
              'settings.profile.subtitle',
              'Update your personal information and how it appears across HyperPay.',
            )}
          </p>
        </header>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="px-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t('settings.profile.sectionMain', 'Profile details')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'settings.profile.sectionMainSubtitle',
                  'Basic information about your account.',
                )}
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t('settings.profile.fullName', 'Full name')}
                placeholder={t('settings.profile.fullNamePlaceholder', 'Jane Doe')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  {t('settings.profile.email', 'Email')}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900">{profile.email}</span>
                  {profile.email_verified === false && (
                    <>
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {t('settings.profile.notVerified', 'Not verified')}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={verifySending}
                        onClick={() => void handleSendVerifyEmail()}
                      >
                        {verifySending ? t('common.sending', 'Sending...') : t('settings.profile.verifyEmail', 'Verify email')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 gap-3 border-t border-slate-100 mt-2">
              <Button type="button" variant="ghost" size="sm" className="text-slate-600" onClick={() => setFullName(profile.full_name ?? '')}>
                {t('settings.profile.discard', 'Discard changes')}
              </Button>
              <Button size="sm" disabled={saving} onClick={() => void handleSave()}>
                {saving ? t('common.saving', 'Saving...') : t('settings.profile.save', 'Save changes')}
              </Button>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setChangePasswordOpen(true)}>
                {t('settings.profile.changePassword', 'Change password')}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Modal
          open={changePasswordOpen}
          size="small"
          title={t('settings.profile.changePassword', 'Change password')}
          subtitle={
            cpStep === 'form'
              ? t(
                  'settings.profile.changePasswordFormSubtitle',
                  'Enter your current password and choose a new password. If they are valid, we will send a verification code to your email.',
                )
              : undefined
          }
          onClose={() => {
            setChangePasswordOpen(false)
            setCpStep('form')
            setCpError(null)
            setCpCode('')
          }}
          footer={
            cpStep === 'form' ? (
              <Button onClick={() => void handleChangePasswordSendCode()} disabled={cpLoading}>
                {cpLoading ? t('common.sending', 'Sending...') : t('settings.profile.continue', 'Continue')}
              </Button>
            ) : null
          }
        >
          <div className="w-full max-w-md mx-auto p-6 space-y-4">
            {cpStep === 'form' ? (
              <>
                {cpError && (
                  <p className="text-sm text-red-600">{cpError}</p>
                )}
                <Input
                  label={t('settings.profile.currentPassword', 'Current password')}
                  type="password"
                  value={cpCurrentPassword}
                  onChange={(e) => setCpCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label={t('settings.profile.newPassword', 'New password')}
                  type="password"
                  value={cpNewPassword}
                  onChange={(e) => setCpNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label={t('settings.profile.confirmPassword', 'Confirm new password')}
                  type="password"
                  value={cpConfirmPassword}
                  onChange={(e) => setCpConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </>
            ) : (
              <VerificationCodeCard
                title={t('settings.profile.verifyChangeTitle', 'Confirm password change')}
                description={t(
                  'settings.profile.verifyChangeDescription',
                  'Enter the 6-digit code we sent to your email to confirm changing your password.',
                )}
                code={cpCode.split('').slice(0, 6)}
                onCodeChange={(arr) => setCpCode(arr.join(''))}
                primaryLabel={
                  cpLoading
                    ? t('common.saving', 'Saving...')
                    : t('settings.profile.updatePassword', 'Update password')
                }
                loading={cpLoading}
                disabled={cpCode.length !== 6 || cpLoading}
                error={cpError}
                onSubmit={() => void handleChangePasswordSubmit()}
                resendLabel={t('settings.profile.resendCode', "Didn't receive a code? Resend")}
                onResend={() => void handleChangePasswordResendCode()}
                secureText={t('verify.secure', 'Secure Encryption Enabled')}
              />
            )}
          </div>
        </Modal>
      </SettingsLayout>
    </AuthenticatedLayout>
  )
}
