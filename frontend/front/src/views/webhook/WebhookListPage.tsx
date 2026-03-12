import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchWebhookConfig } from '../../store/webhookSlice'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

type LogItem = {
  eventType: string
  statusCode: string
  statusTone: 'ok' | 'err'
  entityId: string
  timeAgo: string
}

export const WebhookListPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { config, status } = useAppSelector((s) => s.webhook)

  const loading = status === 'loading'

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchWebhookConfig())
    }
  }, [dispatch, status])

  const endpoints = useMemo(() => {
    if (!config?.url) return []
    return [
      {
        url: config.url,
        createdAtLabel: t('webhook.list.createdAt', 'Created Oct 24, 2023'),
        enabled: config.is_active,
        events: ['payment_intent.succeeded', 'charge.refunded', '+14 more'],
      },
    ]
  }, [config, t])

  const mockLogs = useMemo<LogItem[]>(
    () => [
      {
        eventType: 'payment_intent.succeeded',
        statusCode: '200 OK',
        statusTone: 'ok',
        entityId: 'pi_3Mv2...Y7p',
        timeAgo: t('webhook.list.logs.timeAgo2m', '2 min ago'),
      },
      {
        eventType: 'customer.created',
        statusCode: '200 OK',
        statusTone: 'ok',
        entityId: 'cus_Og9...w1',
        timeAgo: t('webhook.list.logs.timeAgo14m', '14 min ago'),
      },
      {
        eventType: 'charge.failed',
        statusCode: '500 ERR',
        statusTone: 'err',
        entityId: 'ch_8JkL...v4m',
        timeAgo: t('webhook.list.logs.timeAgo1h', '1 hour ago'),
      },
    ],
    [t],
  )

  const [selectedLogIdx, setSelectedLogIdx] = useState(0)
  const selectedLog = mockLogs[selectedLogIdx]

  return (
    <AuthenticatedLayout>
      <section className="max-w-6xl mx-auto">
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
            <Button variant="secondary" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">send</span>
              {t('webhook.actions.test', 'Test event')}
            </Button>
            <Button className="flex items-center gap-2" onClick={() => navigate('/webhooks/new')}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              {t('webhook.list.addEndpoint', 'Add endpoint')}
            </Button>
          </div>
        </div>

        <div className="border-b border-slate-200 mb-6 flex gap-8">
          <button className="border-b-2 border-primary pb-3 text-sm font-semibold text-slate-900">
            {t('webhook.list.tabs.endpoints', 'Endpoints')}
          </button>
          <button className="border-b-2 border-transparent pb-3 text-sm font-medium text-slate-500 hover:text-slate-700">
            {t('webhook.list.tabs.logs', 'Event Logs')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="overflow-hidden">
            <CardHeader className="px-6">
              <h3 className="font-semibold text-slate-900">
                {t('webhook.list.activeEndpoints', 'Active Endpoints')}
              </h3>
            </CardHeader>
            <CardBody className="px-0 py-0">
              <Table>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('webhook.list.table.url', 'Endpoint URL')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('webhook.list.table.status', 'Status')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('webhook.list.table.events', 'Events')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      {t('webhook.list.table.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-sm text-slate-500 text-center">
                        {t('webhook.list.loading', 'Loading endpoints...')}
                      </td>
                    </tr>
                  )}
                  {!loading && endpoints.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-sm text-slate-500 text-center">
                        {t(
                          'webhook.list.empty',
                          'No endpoints configured yet. Click “Add endpoint” to create your first webhook endpoint.',
                        )}
                      </td>
                    </tr>
                  )}
                  {endpoints.map((ep) => (
                    <tr key={ep.url} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">link</span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{ep.url}</p>
                            <p className="text-xs text-slate-500">{ep.createdAtLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ep.enabled ? (
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {ep.events.map((e) => (
                            <span
                              key={e}
                              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-primary px-0"
                          onClick={() => navigate('/webhooks/new')}
                        >
                          <span className="material-symbols-outlined">more_horiz</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="px-4 py-3">
                <div className="flex justify-between items-center w-full">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {t('webhook.list.recentLogs', 'Recent Logs')}
                  </h4>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {t('webhook.list.live', 'LIVE')}
                  </span>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {mockLogs.map((log, idx) => {
                  const selected = idx === selectedLogIdx
                  return (
                    <button
                      key={`${log.eventType}-${idx}`}
                      type="button"
                      onClick={() => setSelectedLogIdx(idx)}
                      className={[
                        'w-full text-left p-4 transition-colors border-l-4',
                        selected
                          ? 'bg-primary/5 border-primary'
                          : 'hover:bg-slate-50 border-transparent',
                      ].join(' ')}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {log.eventType}
                        </span>
                        <span
                          className={[
                            'text-[10px] font-bold px-1.5 rounded',
                            log.statusTone === 'ok'
                              ? 'text-green-600 bg-green-50'
                              : 'text-red-600 bg-red-50',
                          ].join(' ')}
                        >
                          {log.statusCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500 font-mono">{log.entityId}</span>
                        <span className="text-[10px] text-slate-400">{log.timeAgo}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            <div className="lg:col-span-2 bg-slate-950 rounded-xl shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-4 bg-slate-900 flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="text-xs font-semibold text-white border-b-2 border-primary pb-1">
                    {t('webhook.list.viewer.response', 'Response')}
                  </button>
                  <button className="text-xs font-semibold text-slate-400 hover:text-slate-200 pb-1">
                    {t('webhook.list.viewer.payload', 'Payload')}
                  </button>
                  <button className="text-xs font-semibold text-slate-400 hover:text-slate-200 pb-1">
                    {t('webhook.list.viewer.metadata', 'Metadata')}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-white transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                  <button className="text-slate-400 hover:text-white transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
{`{
  "type": "${selectedLog?.eventType ?? t('webhook.list.logs.defaultEventType', 'event')}",
  "id": "evt_...",
  "status": "${selectedLog?.statusCode ?? '200 OK'}"
}`}
                </pre>
              </div>
              <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  {t('webhook.list.viewer.eventId', 'Event ID')}: evt_...
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {t('webhook.list.logs.sampleTime', '12:44:19 PM')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">speed</span>
                    {t('webhook.list.logs.sampleLatency', '142ms')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </section>
    </AuthenticatedLayout>
  )
}

