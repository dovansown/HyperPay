import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchWebhookConfig, saveWebhookConfig, sendTestEvent } from '../../store/webhookSlice'
import { fetchAccounts } from '../../store/accountsSlice'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Switch } from '../../components/ui/Switch'
import { Button } from '../../components/ui/Button'

export const WebhookPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { items: webhooks, status, error } = useAppSelector((s) => s.webhook)
  const editId = (location.state as { editId?: string } | null)?.editId
  const isAddMode = location.pathname === '/webhooks/new' && (location.state as { mode?: string } | null)?.mode === 'add'
  const config = editId ? webhooks.find((w) => w.id === editId) ?? null : null
  const { items: accounts, status: accountStatus } = useAppSelector((s) => s.accounts)

  const [url, setUrl] = useState('https://')
  const [secret, setSecret] = useState('')
  const [accountIds, setAccountIds] = useState<string[]>([])
  const [transactionDirection, setTransactionDirection] = useState<'IN' | 'OUT' | 'BOTH'>('BOTH')
  const [retryOnNon2xx, setRetryOnNon2xx] = useState(true)
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(3)
  const [contentType, setContentType] = useState<'JSON' | 'FORM_URLENCODED'>('JSON')
  const [authType, setAuthType] = useState<'NONE' | 'BEARER' | 'BASIC' | 'HEADER'>('NONE')
  const [authHeaderName, setAuthHeaderName] = useState('')
  const [authHeaderValue, setAuthHeaderValue] = useState('')
  const [authBearerToken, setAuthBearerToken] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [requirePaymentCode, setRequirePaymentCode] = useState(false)
  const [paymentCodeRuleEnabled, setPaymentCodeRuleEnabled] = useState(false)
  const [paymentCodePrefix, setPaymentCodePrefix] = useState('')
  const [paymentCodeSuffixMinLength, setPaymentCodeSuffixMinLength] = useState(8)
  const [paymentCodeSuffixMaxLength, setPaymentCodeSuffixMaxLength] = useState(12)
  const [paymentCodeSuffixCharset, setPaymentCodeSuffixCharset] = useState<
    'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC'
  >('NUMERIC')
  const [isActive, setIsActive] = useState(true)
  const [clientError, setClientError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const loading = status === 'loading'
  const hasWebhookConfig = useMemo(() => Boolean(config?.url), [config])

  useEffect(() => {
    void dispatch(fetchWebhookConfig())
  }, [dispatch])
  useEffect(() => {
    if (accountStatus === 'idle') {
      void dispatch(fetchAccounts())
    }
  }, [accountStatus, dispatch])

  useEffect(() => {
    if (!config || isAddMode) return
    setUrl(config.url || 'https://')
    setSecret(config.secret_token || '')
    setAccountIds((config.account_ids ?? []).map(String))
    setTransactionDirection(config.transaction_direction ?? 'BOTH')
    setRetryOnNon2xx(config.retry_on_non_2xx ?? true)
    setMaxRetryAttempts(config.max_retry_attempts ?? 3)
    setContentType(config.content_type ?? 'JSON')
    setAuthType(config.auth_type ?? 'NONE')
    setAuthHeaderName(config.auth_header_name ?? '')
    setAuthHeaderValue(config.auth_header_value ?? '')
    setAuthBearerToken(config.auth_bearer_token ?? '')
    setAuthUsername(config.auth_username ?? '')
    setAuthPassword(config.auth_password ?? '')
    setRequirePaymentCode(config.require_payment_code ?? false)
    setPaymentCodeRuleEnabled(config.payment_code_rule_enabled ?? false)
    setPaymentCodePrefix(config.payment_code_prefix ?? '')
    setPaymentCodeSuffixMinLength(config.payment_code_suffix_min_length ?? 8)
    setPaymentCodeSuffixMaxLength(config.payment_code_suffix_max_length ?? 12)
    setPaymentCodeSuffixCharset(config.payment_code_suffix_charset ?? 'NUMERIC')
    setIsActive(config.is_active)
  }, [config, isAddMode])

  const validateForm = () => {
    if (authType === 'BEARER' && !authBearerToken.trim()) {
      return t('webhook.validation.bearerRequired', 'Bearer token is required when auth type is BEARER.')
    }
    if (authType === 'BASIC' && (!authUsername.trim() || !authPassword.trim())) {
      return t(
        'webhook.validation.basicRequired',
        'Username and password are required when auth type is BASIC.',
      )
    }
    if (authType === 'HEADER' && (!authHeaderName.trim() || !authHeaderValue.trim())) {
      return t(
        'webhook.validation.headerRequired',
        'Header name and header value are required when auth type is HEADER.',
      )
    }
    if (paymentCodeRuleEnabled) {
      if (!paymentCodePrefix.trim()) {
        return t(
          'webhook.validation.prefixRequired',
          'Payment code prefix is required when rule is enabled.',
        )
      }
      if (paymentCodeSuffixMinLength > paymentCodeSuffixMaxLength) {
        return t(
          'webhook.validation.minMaxInvalid',
          'Min suffix length must be less than or equal to max suffix length.',
        )
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setClientError(null)
    const validationError = validateForm()
    if (validationError) {
      setClientError(validationError)
      return
    }
    try {
      await dispatch(
        saveWebhookConfig({
          id: editId,
          url,
          secret_token: secret,
          account_ids: accountIds,
          transaction_direction: transactionDirection,
          retry_on_non_2xx: retryOnNon2xx,
          max_retry_attempts: maxRetryAttempts,
          content_type: contentType,
          auth_type: authType,
          auth_header_name: authType === 'HEADER' ? authHeaderName.trim() : undefined,
          auth_header_value: authType === 'HEADER' ? authHeaderValue.trim() : undefined,
          auth_bearer_token: authType === 'BEARER' ? authBearerToken.trim() : undefined,
          auth_username: authType === 'BASIC' ? authUsername.trim() : undefined,
          auth_password: authType === 'BASIC' ? authPassword.trim() : undefined,
          require_payment_code: requirePaymentCode,
          payment_code_rule_enabled: paymentCodeRuleEnabled,
          payment_code_prefix: paymentCodeRuleEnabled ? paymentCodePrefix.trim() : undefined,
          payment_code_suffix_min_length: paymentCodeRuleEnabled ? paymentCodeSuffixMinLength : undefined,
          payment_code_suffix_max_length: paymentCodeRuleEnabled ? paymentCodeSuffixMaxLength : undefined,
          payment_code_suffix_charset: paymentCodeRuleEnabled ? paymentCodeSuffixCharset : undefined,
          is_active: isActive,
        }),
      ).unwrap()
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <section className="max-w-5xl mx-auto">
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-primary font-medium cursor-default">
            {t('webhook.breadcrumb.root', 'Developers')}
          </span>
          <span className="text-slate-400 flex items-center">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </span>
          <span className="text-slate-900 font-semibold">
            {t('webhook.breadcrumb.current', 'Webhooks')}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {t('webhook.title', 'Webhooks')}
            </h1>
            <p className="text-slate-custom max-w-2xl text-sm">
              {t(
                'webhook.subtitle',
                'Receive real-time notifications from HyperPay when events happen in your account.',
              )}{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                {t('webhook.learnMore', 'Learn more about webhooks')}
              </a>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => navigate('/webhooks')}
            >
              {t('webhook.actions.backToList', 'Back to list')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex items-center gap-2"
              disabled={testLoading || !hasWebhookConfig}
              loading={testLoading}
              onClick={async () => {
                setTestMessage(null)
                setTestLoading(true)
                try {
                  const result = await dispatch(sendTestEvent(editId ?? undefined)).unwrap()
                  setTestMessage(
                    result.queued
                      ? t('webhook.test.queued', 'Đã đưa sự kiện thử vào hàng đợi. Kết quả sẽ hiển thị trong Nhật ký gần đây.')
                      : t('webhook.test.error', 'Gửi thử thất bại.')
                  )
                } catch (e) {
                  setTestMessage(e instanceof Error ? e.message : t('webhook.test.error', 'Gửi thử thất bại.'))
                } finally {
                  setTestLoading(false)
                }
              }}
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              {t('webhook.actions.test', 'Test event')}
            </Button>
          </div>
        </div>

        <div className="border-b border-slate-200 mb-6 flex gap-8">
          <button className="border-b-2 border-primary pb-3 text-sm font-semibold text-slate-900">
            {t('webhook.tabs.settings', 'Endpoint')}
          </button>
        </div>

        {testMessage && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              testMessage.includes('hàng đợi') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {testMessage}
          </div>
        )}

        <Card className="mb-8 overflow-hidden">
          <CardHeader className="px-6">
            <h3 className="font-semibold text-slate-900">
              {hasWebhookConfig
                ? t('webhook.form.title', 'Active endpoint')
                : t('webhook.form.newTitle', 'Create webhook endpoint')}
            </h3>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="size-1.5 rounded-full bg-green-500" />
                {t('webhook.form.status.enabled', 'Enabled')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <span className="size-1.5 rounded-full bg-slate-400" />
                {t('webhook.form.status.disabled', 'Disabled')}
              </span>
            )}
          </CardHeader>

          <CardBody className="px-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                id="url"
                type="url"
                label={t('webhook.form.urlLabel', 'Endpoint URL')}
                placeholder={t(
                  'webhook.form.urlPlaceholder',
                  'https://your-system.com/webhooks/hyperpay',
                )}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                hint={t(
                  'webhook.form.urlHintPost',
                  'Endpoint phải chấp nhận request POST với body JSON. URL chỉ dùng GET (ví dụ /me) sẽ trả 404 khi gửi webhook.',
                )}
              />
              <Input
                id="secret"
                type="text"
                label={t('webhook.form.secretLabel', 'Signing secret')}
                placeholder={t('webhook.form.secretPlaceholder', 'whsec_...')}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                hint={t(
                  'webhook.form.secretHint',
                  'Use this secret to verify that webhook events are sent from HyperPay.',
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('webhook.form.accountsLabel', 'Linked bank accounts')}
                </label>
                <div className="rounded-lg border border-slate-200 p-3 max-h-44 overflow-auto space-y-2">
                  {accounts.length === 0 && (
                    <p className="text-xs text-slate-500">
                      {t('webhook.form.accountsEmpty', 'No bank accounts found. Add account in Banking first.')}
                    </p>
                  )}
                  {accounts.map((acc) => {
                    const checked = accountIds.includes(acc.id)
                    return (
                      <div key={acc.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <Switch
                          checked={checked}
                          onChange={(next) => {
                            setAccountIds((prev) =>
                              next ? [...prev, acc.id] : prev.filter((id) => id !== acc.id),
                            )
                          }}
                          label={`${acc.bank_name} - •••• ${acc.account_number.slice(-4)}`}
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  {t(
                    'webhook.form.accountsHint',
                    'If none selected, webhook receives events from all eligible accounts.',
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    {t('webhook.form.transactionDirection', 'Transaction direction')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={transactionDirection}
                    onChange={(e) => setTransactionDirection(e.target.value as 'IN' | 'OUT' | 'BOTH')}
                  >
                    <option value="BOTH">{t('webhook.form.transactionDirectionBoth', 'BOTH')}</option>
                    <option value="IN">{t('webhook.form.transactionDirectionIn', 'IN')}</option>
                    <option value="OUT">{t('webhook.form.transactionDirectionOut', 'OUT')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    {t('webhook.form.contentType', 'Content type')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as 'JSON' | 'FORM_URLENCODED')}
                  >
                    <option value="JSON">{t('webhook.form.contentTypeJson', 'JSON')}</option>
                    <option value="FORM_URLENCODED">
                      {t('webhook.form.contentTypeFormUrlencoded', 'FORM_URLENCODED')}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Switch
                  checked={retryOnNon2xx}
                  onChange={(next) => setRetryOnNon2xx(next)}
                  label={t('webhook.form.retryOnNon2xx', 'Retry on non-2xx responses')}
                />
                <Input
                  id="max-retry"
                  type="number"
                  label={t('webhook.form.maxRetryAttempts', 'Max retry attempts')}
                  value={String(maxRetryAttempts)}
                  onChange={(e) => setMaxRetryAttempts(Number(e.target.value))}
                  min={1}
                  max={10}
                  required
                />
              </div>

              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <h4 className="font-medium text-slate-900">
                  {t('webhook.form.authTitle', 'Authentication')}
                </h4>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    {t('webhook.form.authType', 'Auth type')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as 'NONE' | 'BEARER' | 'BASIC' | 'HEADER')}
                  >
                    <option value="NONE">{t('webhook.form.authTypeNone', 'NONE')}</option>
                    <option value="BEARER">{t('webhook.form.authTypeBearer', 'BEARER')}</option>
                    <option value="BASIC">{t('webhook.form.authTypeBasic', 'BASIC')}</option>
                    <option value="HEADER">{t('webhook.form.authTypeHeader', 'HEADER')}</option>
                  </select>
                </div>
                {authType === 'BEARER' && (
                  <Input
                    id="auth-bearer-token"
                    type="text"
                    label={t('webhook.form.authBearerToken', 'Bearer token')}
                    value={authBearerToken}
                    onChange={(e) => setAuthBearerToken(e.target.value)}
                    required
                  />
                )}
                {authType === 'BASIC' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="auth-username"
                      type="text"
                      label={t('webhook.form.authUsername', 'Username')}
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                    />
                    <Input
                      id="auth-password"
                      type="password"
                      label={t('webhook.form.authPassword', 'Password')}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                {authType === 'HEADER' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="auth-header-name"
                      type="text"
                      label={t('webhook.form.authHeaderName', 'Header name')}
                      value={authHeaderName}
                      onChange={(e) => setAuthHeaderName(e.target.value)}
                      required
                    />
                    <Input
                      id="auth-header-value"
                      type="text"
                      label={t('webhook.form.authHeaderValue', 'Header value')}
                      value={authHeaderValue}
                      onChange={(e) => setAuthHeaderValue(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <h4 className="font-medium text-slate-900">
                  {t('webhook.form.paymentRulesTitle', 'Payment code rules')}
                </h4>
                <Switch
                  checked={requirePaymentCode}
                  onChange={(next) => setRequirePaymentCode(next)}
                  label={t('webhook.form.requirePaymentCode', 'Require payment code')}
                />
                <Switch
                  checked={paymentCodeRuleEnabled}
                  onChange={(next) => setPaymentCodeRuleEnabled(next)}
                  label={t(
                    'webhook.form.enablePaymentCodeRule',
                    'Enable payment code extraction rule',
                  )}
                />
                {paymentCodeRuleEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="payment-prefix"
                      type="text"
                      label={t('webhook.form.paymentPrefix', 'Prefix')}
                      value={paymentCodePrefix}
                      onChange={(e) => setPaymentCodePrefix(e.target.value.toUpperCase())}
                      required
                    />
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">
                        {t('webhook.form.suffixCharset', 'Suffix charset')}
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={paymentCodeSuffixCharset}
                        onChange={(e) =>
                          setPaymentCodeSuffixCharset(
                            e.target.value as 'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC',
                          )
                        }
                      >
                        <option value="NUMERIC">{t('webhook.form.suffixCharsetNumeric', 'NUMERIC')}</option>
                        <option value="ALPHA">{t('webhook.form.suffixCharsetAlpha', 'ALPHA')}</option>
                        <option value="ALPHANUMERIC">
                          {t('webhook.form.suffixCharsetAlphanumeric', 'ALPHANUMERIC')}
                        </option>
                      </select>
                    </div>
                    <Input
                      id="payment-min"
                      type="number"
                      label={t('webhook.form.suffixMinLength', 'Suffix min length')}
                      value={String(paymentCodeSuffixMinLength)}
                      onChange={(e) => setPaymentCodeSuffixMinLength(Number(e.target.value))}
                      min={1}
                      max={32}
                      required
                    />
                    <Input
                      id="payment-max"
                      type="number"
                      label={t('webhook.form.suffixMaxLength', 'Suffix max length')}
                      value={String(paymentCodeSuffixMaxLength)}
                      onChange={(e) => setPaymentCodeSuffixMaxLength(Number(e.target.value))}
                      min={1}
                      max={32}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Switch
                  checked={isActive}
                  onChange={(next) => setIsActive(next)}
                  label={t('webhook.form.activeToggle', 'Enable this endpoint')}
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {clientError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {clientError}
                </div>
              )}
              {saved && !error && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
                  {t('webhook.form.saved', 'Webhook configuration saved successfully.')}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 px-0"
                  onClick={() => {
                    if (!config) return
                    setUrl(config.url || 'https://')
                    setSecret(config.secret_token || '')
                    setAccountIds((config.account_ids ?? []).map(String))
                    setTransactionDirection(config.transaction_direction ?? 'BOTH')
                    setRetryOnNon2xx(config.retry_on_non_2xx ?? true)
                    setMaxRetryAttempts(config.max_retry_attempts ?? 3)
                    setContentType(config.content_type ?? 'JSON')
                    setAuthType(config.auth_type ?? 'NONE')
                    setAuthHeaderName(config.auth_header_name ?? '')
                    setAuthHeaderValue(config.auth_header_value ?? '')
                    setAuthBearerToken(config.auth_bearer_token ?? '')
                    setAuthUsername(config.auth_username ?? '')
                    setAuthPassword(config.auth_password ?? '')
                    setRequirePaymentCode(config.require_payment_code ?? false)
                    setPaymentCodeRuleEnabled(config.payment_code_rule_enabled ?? false)
                    setPaymentCodePrefix(config.payment_code_prefix ?? '')
                    setPaymentCodeSuffixMinLength(config.payment_code_suffix_min_length ?? 8)
                    setPaymentCodeSuffixMaxLength(config.payment_code_suffix_max_length ?? 12)
                    setPaymentCodeSuffixCharset(config.payment_code_suffix_charset ?? 'NUMERIC')
                    setIsActive(config.is_active)
                    setClientError(null)
                  }}
                >
                  {t('webhook.form.reset', 'Reset')}
                </Button>
                <Button type="submit" size="md" loading={loading}>
                  {loading ? t('webhook.form.saving', 'Saving...') : t('webhook.form.save', 'Save changes')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>
    </AuthenticatedLayout>
  )
}

