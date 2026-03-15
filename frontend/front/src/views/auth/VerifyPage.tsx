import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { VerificationCodeCard } from '../../components/ui/VerificationCodeCard'
import { apiFetch, unwrapApiData } from '../../lib/apiClient'
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

  const code = digits.join('')

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
        const res = await apiFetch<{ token: string; user?: unknown }>('/auth/verify', {
          method: 'POST',
          body: { verification_id: verificationId, code, type },
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
  }, [code, verificationId, type, tempToken, t])


  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-8 md:p-10">
          <VerificationCodeCard
            title={t('verify.title', 'Verify your identity')}
            description={t('verify.description', "We've sent a 6-digit verification code. Enter it below.")}
            code={digits}
            onCodeChange={setDigits}
            primaryLabel={loading ? t('verify.submitting', 'Verifying...') : t('verify.primaryCta', 'Verify and continue')}
            loading={loading}
            disabled={code.length !== DIGIT_COUNT || loading}
            error={error}
            onSubmit={submitCode}
            secureText={t('verify.secure', 'Secure Encryption Enabled')}
          />
        </div>
      </div>
    </AuthLayout>
  )
}
