import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { VerificationCodeCard } from '../../components/ui/VerificationCodeCard'
import { apiFetch, unwrapApiData } from '../../lib/apiClient'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAppDispatch } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/authSlice'

const DIGIT_COUNT = 6

export const VerifyPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const verificationId = searchParams.get('verification_id') ?? ''
  const type = (searchParams.get('type') ?? 'login') as 'email' | 'login'
  const tempToken = searchParams.get('temp_token') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [email, setEmail] = useState('')

  const code = digits.join('')

  const verifyWithCode = useCallback(
    async (value: string) => {
      if (value.length !== DIGIT_COUNT) return
      setError(null)
      setLoading(true)
      try {
        if (tempToken) {
          const res = await apiFetch<{ token: string; user?: unknown }>('/auth/2fa', {
            method: 'POST',
            body: { temp_token: tempToken, code: value },
          })
          const data = unwrapApiData(res)
          if (data.token) {
            // Chỉ tin vào token, user sẽ được load lại qua /users/me
            localStorage.setItem('hyperpay.auth.v1', JSON.stringify({ token: data.token, user: null }))
            try {
              await dispatch(fetchCurrentUser()).unwrap()
            } catch {
              // ignore
            }
            window.location.href = '/dashboard'
          }
        } else if (verificationId) {
          const res = await apiFetch<{ token: string; user?: unknown }>('/auth/verify', {
            method: 'POST',
            body: { verification_id: verificationId, code: value, type },
          })
          const data = unwrapApiData(res)
          if (data.token) {
            localStorage.setItem('hyperpay.auth.v1', JSON.stringify({ token: data.token, user: null }))
            try {
              await dispatch(fetchCurrentUser()).unwrap()
            } catch {
              // ignore
            }
            window.location.href = '/dashboard'
          }
        } else {
          setError(t('verify.missingParams', 'Missing verification ID or temp token.'))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t('verify.error', 'Verification failed.'))
      } finally {
        setLoading(false)
      }
    },
    [dispatch, t, tempToken, type, verificationId],
  )

  const submitCode = useCallback(async () => {
    if (code.length !== DIGIT_COUNT) return
    setError(null)
    setLoading(true)
    try {
      if (tempToken) {
        const res = await apiFetch<{ token: string; user?: unknown }>('/auth/2fa', {
          method: 'POST',
          body: { temp_token: tempToken, code },
        })
        const data = unwrapApiData(res)
        if (data.token) {
          // Chỉ tin vào token, user sẽ được load lại qua /users/me
          localStorage.setItem('hyperpay.auth.v1', JSON.stringify({ token: data.token, user: null }))
          try {
            await dispatch(fetchCurrentUser()).unwrap()
          } catch {
            // ignore
          }
          window.location.href = '/dashboard'
        }
      } else if (verificationId) {
        await verifyWithCode(code)
      } else {
        setError(t('verify.missingParams', 'Missing verification ID or temp token.'))
      }
    } finally {
      // verifyWithCode đã tự handle loading
    }
  }, [code, tempToken, verificationId, t, verifyWithCode])

  // Nếu link trong email có kèm luôn mã code (?code=xxxxxx) thì tự động verify và vào dashboard
  useEffect(() => {
    const raw = searchParams.get('code') ?? ''
    const numeric = raw.replace(/\D/g, '').slice(0, DIGIT_COUNT)
    if (numeric.length === DIGIT_COUNT && verificationId && !tempToken) {
      // Auto-fill UI cho đẹp, rồi tự call verify
      setDigits(numeric.split(''))
      void verifyWithCode(numeric)
    }
  }, [searchParams, tempToken, verificationId, verifyWithCode])

  const handleResend = useCallback(async () => {
    setError(null)
    setInfo(null)
    setResending(true)
    try {
      // Gửi lại email xác thực cho user hiện tại (giống trong màn Profile)
      await apiFetch('/users/me/email/send-verification', {
        method: 'POST',
      })
      setInfo(t('verify.resendSuccess', 'A new verification email has been sent.'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('verify.resendError', 'Failed to resend verification email.'))
    } finally {
      setResending(false)
    }
  }, [t])

  const handleChangeEmail = useCallback(async () => {
    if (!email) return
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      // Cập nhật email, service backend sẽ tự gửi lại email xác thực
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: { full_name: undefined, email }, // backend chỉ dùng field hợp lệ, các field thừa bị bỏ qua
      })
      await apiFetch('/users/me/email/send-verification', {
        method: 'POST',
      })
      setInfo(t('verify.changeEmailSuccess', 'Email updated. Please check your new inbox for a verification email.'))
      setEmailModalOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('verify.changeEmailError', 'Failed to update email.'))
    } finally {
      setLoading(false)
    }
  }, [email, t])


  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-8 md:p-10">
          <VerificationCodeCard
            title={t('verify.title', 'Verify your email')}
            description={t('verify.description', "We've sent a 6-digit verification code to your email. Enter it below.")}
            code={digits}
            onCodeChange={setDigits}
            primaryLabel={loading ? t('verify.submitting', 'Verifying...') : t('verify.primaryCta', 'Verify email')}
            loading={loading}
            disabled={code.length !== DIGIT_COUNT || loading}
            error={error}
            onSubmit={submitCode}
            resendLabel={
              type === 'email'
                ? t('verify.resendOrChange', "Didn't receive anything? Resend email or change email")
                : undefined
            }
            onResend={
              type === 'email'
                ? () => {
                    // Chỉ bật modal khi user click vào phần "Thay đổi email",
                    // nên ở đây vẫn ưu tiên hành vi resend mặc định.
                    void handleResend()
                  }
                : undefined
            }
            secureText={t('verify.secure', 'Secure Encryption Enabled')}
          />
          {(type === 'email' || !type) && (
            <div className="mt-6 space-y-4">
              {info && <p className="text-xs text-emerald-600 text-center">{info}</p>}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs text-slate-500 text-center">
                  {t(
                    'verify.changeEmailInline',
                    "Didn't receive anything? Resend email or change email.",
                  )}{' '}
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline underline-offset-4"
                    onClick={() => setEmailModalOpen(true)}
                  >
                    {t('verify.changeEmailAction', 'Change email')}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
        <Modal
          open={emailModalOpen}
          size="small"
          title={t('verify.changeEmailModalTitle', 'Change email address')}
          subtitle={t(
            'verify.changeEmailModalSubtitle',
            'Enter a new email address. We will send a new verification email to this address.',
          )}
          onClose={() => setEmailModalOpen(false)}
          footer={
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
              onClick={() => void handleChangeEmail()}
              disabled={loading || !email}
            >
              {loading
                ? t('verify.changeEmailSaving', 'Updating...')
                : t('verify.updateEmailCta', 'Update email')}
            </button>
          }
        >
          <div className="w-full max-w-md mx-auto p-6 space-y-4">
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Input
              id="verify-email-change-modal"
              type="email"
              label={t('verify.newEmailLabel', 'New email')}
              placeholder={t('verify.newEmailPlaceholder', 'Enter new email address')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </AuthLayout>
  )
}
