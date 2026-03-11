import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchWebhookConfig, saveWebhookConfig } from '../../store/webhookSlice'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'

export const WebhookPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { config, status, error } = useAppSelector((s) => s.webhook)

  const [url, setUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saved, setSaved] = useState(false)

  const loading = status === 'loading'

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchWebhookConfig())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (config) {
      setUrl(config.url)
      setSecret(config.secret_token)
      setIsActive(config.is_active)
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    try {
      await dispatch(
        saveWebhookConfig({
          url,
          secret_token: secret,
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

        <Card className="mb-8 overflow-hidden">
          <CardHeader className="px-6">
            <h3 className="font-semibold text-slate-900">
              {t('webhook.form.title', 'Active endpoint')}
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

              <div className="flex items-center justify-between pt-2">
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  label={t('webhook.form.activeToggle', 'Enable this endpoint')}
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
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
                    if (config) {
                      setUrl(config.url)
                      setSecret(config.secret_token)
                      setIsActive(config.is_active)
                    }
                  }}
                >
                  {t('webhook.form.reset', 'Reset')}
                </Button>
                <Button type="submit" size="md" loading={loading}>
                  {loading
                    ? t('webhook.form.saving', 'Saving...')
                    : t('webhook.form.save', 'Save changes')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardBody className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary bg-primary/20 p-2 rounded-lg">
                shield
              </span>
              <div>
                <h5 className="font-bold text-slate-900 mb-1">
                  {t('webhook.info.verifyTitle', 'Verify signatures')}
                </h5>
                <p className="text-sm text-slate-600">
                  {t(
                    'webhook.info.verifyDescription',
                    'Use HyperPay libraries to verify that events are coming from us. Secure your integration with a signing secret.',
                  )}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:underline flex items-center gap-1 px-0"
                >
                  {t('webhook.info.viewSecret', 'View signing secret')}{' '}
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-start gap-4">
              <span className="material-symbols-outlined text-slate-500 bg-slate-100 p-2 rounded-lg">
                integration_instructions
              </span>
              <div>
                <h5 className="font-bold text-slate-900 mb-1">
                  {t('webhook.info.localTitle', 'Local testing')}
                </h5>
                <p className="text-sm text-slate-600">
                  {t(
                    'webhook.info.localDescription',
                    'Test your webhooks locally with our CLI tool. Forward events directly to your local server.',
                  )}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:underline flex items-center gap-1 px-0"
                >
                  {t('webhook.info.installCli', 'Install CLI')}{' '}
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </AuthenticatedLayout>
  )
}

