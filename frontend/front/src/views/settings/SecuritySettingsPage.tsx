import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { SettingsLayout } from './SettingsLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { VerificationCodeInput } from '../../components/ui/VerificationCodeInput'
import { useAppSelector } from '../../store/hooks'
import { apiFetch, unwrapApiData } from '../../lib/apiClient'

type TwoFASetup = { secret: string; qrUrl: string } | null

export const SecuritySettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const token = useAppSelector((s) => s.auth.token)
  const [twoFASetup, setTwoFASetup] = useState<TwoFASetup | undefined>(undefined)
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [twoFAError, setTwoFAError] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [totpEnabled, setTotpEnabled] = useState(false)

  const fetch2FAState = async () => {
    try {
      const profileRes = await apiFetch<{ totp_enabled?: boolean }>('/users/me', { token: token ?? undefined })
      const profile = unwrapApiData(profileRes) as { totp_enabled?: boolean }
      if (profile?.totp_enabled) {
        setTotpEnabled(true)
        setTwoFASetup(null)
        return
      }
      const setupRes = await apiFetch<TwoFASetup>('/users/me/2fa/setup', { token: token ?? undefined })
      const setup = unwrapApiData(setupRes)
      setTwoFASetup(setup)
    } catch {
      setTotpEnabled(false)
      setTwoFASetup(null)
    }
  }

  useEffect(() => {
    void fetch2FAState()
  }, [token])

  const handleEnable2FA = async () => {
    const code = twoFACode.replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) {
      setTwoFAError(t('settings.security.enter6Digits', 'Enter 6-digit code'))
      return
    }
    setTwoFAError(null)
    setTwoFALoading(true)
    try {
      const res = await apiFetch<{ backupCodes: string[] }>('/users/me/2fa/confirm', {
        method: 'POST',
        token: token ?? undefined,
        body: { code },
      })
      const data = unwrapApiData(res)
      setBackupCodes(data.backupCodes ?? [])
      setTotpEnabled(true)
      setTwoFASetup(null)
      setTwoFACode('')
    } catch (e) {
      setTwoFAError(e instanceof Error ? e.message : 'Failed to enable 2FA')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!window.confirm(t('settings.security.disable2FAConfirm', 'Are you sure you want to disable 2FA?'))) return
    try {
      await apiFetch('/users/me/2fa/disable', { method: 'POST', token: token ?? undefined })
      setTotpEnabled(false)
      setBackupCodes([])
      void fetch2FAState()
    } catch {
      // ignore
    }
  }

  const formatSecret = (s: string) => (s || '').replace(/(.{4})/g, '$1 ').trim()

  return (
    <AuthenticatedLayout>
      <SettingsLayout>
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">
            {t('settings.security.title', 'Security settings')}
          </h2>
          <p className="text-slate-custom text-sm">
            {t(
              'settings.security.subtitle',
              'Manage security preferences and how access is protected across your account.',
            )}
          </p>
        </header>

        <Card>
          <CardHeader className="px-6">
            <h3 className="text-lg font-bold text-slate-900">
              {t('settings.security.mfaTitle', 'Two-Factor Authentication')}
            </h3>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-6">
            <p className="text-sm text-slate-600">
              {t(
                'settings.security.mfaDescription',
                'Add an extra layer of security by requiring a code from your authenticator app when you sign in.',
              )}
            </p>

            {totpEnabled ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('settings.security.mfaStatusOn', 'Authenticator app')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('settings.security.mfaEnabled', 'Enabled')}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => void handleDisable2FA()}>
                  {t('settings.security.mfaDisable', 'Disable 2FA')}
                </Button>
              </div>
            ) : twoFASetup === undefined ? (
              <p className="text-sm text-slate-500">{t('common.loading', 'Loading...')}</p>
            ) : twoFASetup === null ? (
              <p className="text-sm text-slate-500">{t('settings.security.mfaSetupError', 'Could not load 2FA setup.')}</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {t('settings.security.scanQR', '1. Scan the QR code with your app')}
                  </p>
                  <div className="flex justify-center p-6 bg-white dark:bg-slate-800/50 border border-primary/10 rounded-xl">
                    {twoFASetup.qrUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(twoFASetup.qrUrl)}`}
                        alt="QR code"
                        className="w-48 h-48 rounded border border-slate-200"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                        QR
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {t('settings.security.manualKey', '2. Or enter the key manually')}
                  </p>
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg gap-2 flex-wrap">
                    <code className="text-primary font-mono font-bold text-sm tracking-widest break-all">
                      {formatSecret(twoFASetup.secret)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary"
                      onClick={() => navigator.clipboard.writeText(twoFASetup!.secret)}
                    >
                      {t('common.copy', 'Copy')}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('settings.security.enterCode', '3. Enter the 6-digit code from your app')}
                  </label>
                  <VerificationCodeInput
                    idPrefix="2fa-code"
                    value={twoFACode.split('').slice(0, 6)}
                    onChange={(arr) => setTwoFACode(arr.join(''))}
                    autoFocus
                  />
                  {twoFAError && (
                    <p className="text-sm text-red-600 mt-1">{twoFAError}</p>
                  )}
                  <Button
                    className="mt-4 w-full"
                    disabled={twoFACode.length !== 6 || twoFALoading}
                    onClick={() => void handleEnable2FA()}
                  >
                    {twoFALoading ? t('common.saving', 'Saving...') : t('settings.security.verifyAndEnable', 'Verify and Enable 2FA')}
                  </Button>
                </div>
              </div>
            )}

            {backupCodes.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {t('settings.security.backupCodes', 'Save your recovery codes')}
                </p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-xl font-mono text-sm text-slate-600 dark:text-slate-400">
                  {backupCodes.map((c) => (
                    <div key={c}>{c}</div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </SettingsLayout>
    </AuthenticatedLayout>
  )
}
