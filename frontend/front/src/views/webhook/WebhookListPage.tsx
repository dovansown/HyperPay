import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchWebhookConfig, fetchWebhookLogs, type WebhookDeliveryLogEntry } from '../../store/webhookSlice'
import { DeleteWebhookModal } from './DeleteWebhookModal'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

function formatTimeAgo(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return d.toLocaleDateString()
}

export const WebhookListPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: webhooks, status, error, logs, logsStatus } = useAppSelector((s) => s.webhook)

  const loading = status === 'loading'
  const failed = status === 'failed'

  useEffect(() => {
    void dispatch(fetchWebhookConfig())
  }, [dispatch])

  useEffect(() => {
    if (status === 'succeeded' || status === 'idle') {
      void dispatch(fetchWebhookLogs())
    }
  }, [dispatch, status])

  const endpoints = useMemo(() => {
    return webhooks.map((w) => {
      const dir = w.transaction_direction
      const directionLabel =
        dir === 'BOTH'
          ? t('webhook.form.transactionDirectionBoth', 'BOTH')
          : dir === 'IN'
            ? t('webhook.form.transactionDirectionIn', 'IN')
            : t('webhook.form.transactionDirectionOut', 'OUT')
      return {
        id: w.id,
        url: w.url,
        enabled: w.is_active,
        events: [directionLabel],
      }
    })
  }, [webhooks, t])

  const webhookLogs = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        eventType: log.event_type,
        statusCode: String(log.response_status_code),
        statusTone: (log.success ? 'ok' : 'err') as 'ok' | 'err',
        entityId: `#${log.id}`,
        timeAgo: formatTimeAgo(log.created_at),
      })),
    [logs]
  )
  const [selectedLogIdx, setSelectedLogIdx] = useState<number | null>(null)
  const [viewerTab, setViewerTab] = useState<'response' | 'payload' | 'metadata'>('response')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const [deletingWebhook, setDeletingWebhook] = useState<{ id: string; url: string } | null>(null)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (openMenuId === null) {
      setMenuAnchor(null)
      return
    }
    const rect = menuTriggerRef.current?.getBoundingClientRect()
    setMenuAnchor(rect ?? null)
  }, [openMenuId])

  useEffect(() => {
    if (openMenuId === null) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuTriggerRef.current?.contains(target)) return
      const menuEl = document.getElementById('webhook-endpoint-menu-portal')
      if (menuEl?.contains(target)) return
      setOpenMenuId(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [openMenuId])

  const selectedLog: WebhookDeliveryLogEntry | null =
    selectedLogIdx !== null ? logs[selectedLogIdx] ?? null : null

  const viewerContent = (() => {
    if (!selectedLog) return null
    switch (viewerTab) {
      case 'response': {
        const obj: Record<string, unknown> = {
          status_code: selectedLog.response_status_code,
          success: selectedLog.success,
          error_message: selectedLog.error_message ?? undefined,
        }
        if (selectedLog.response_body != null && selectedLog.response_body !== '') {
          try {
            obj.body = JSON.parse(selectedLog.response_body) as unknown
          } catch {
            obj.body = selectedLog.response_body
          }
        }
        return JSON.stringify(obj, null, 2)
      }
      case 'payload': {
        const raw = selectedLog.request_payload
        if (raw == null || raw === '') return '(empty)'
        try {
          return JSON.stringify(JSON.parse(raw), null, 2)
        } catch {
          return raw
        }
      }
      case 'metadata':
      default:
        return JSON.stringify(
          {
            id: selectedLog.id,
            url: selectedLog.url,
            event_type: selectedLog.event_type,
            created_at: selectedLog.created_at,
            response_status_code: selectedLog.response_status_code,
            success: selectedLog.success,
          },
          null,
          2
        )
    }
  })()

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

        {failed && error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4 flex-wrap" role="alert">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => void dispatch(fetchWebhookConfig())}>
              {t('common.retry')}
            </Button>
          </div>
        )}

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
            <Button className="flex items-center gap-2" onClick={() => navigate('/webhooks/new', { state: { mode: 'add' } })}>
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
                    <tr key={ep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">link</span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{ep.url}</p>
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
                        <button
                          ref={openMenuId === ep.id ? menuTriggerRef : undefined}
                          type="button"
                          className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === ep.id ? null : ep.id)
                          }}
                          aria-haspopup="true"
                          aria-expanded={openMenuId === ep.id}
                        >
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {openMenuId !== null && menuAnchor && (() => {
            const ep = endpoints.find((e) => e.id === openMenuId)
            if (!ep) return null
            return createPortal(
              <div
                id="webhook-endpoint-menu-portal"
                role="menu"
                className="fixed min-w-[180px] py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-[100]"
                style={{
                  top: menuAnchor.bottom + 4,
                  right: window.innerWidth - menuAnchor.right,
                }}
              >
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null)
                    navigate('/webhooks/new', { state: { editId: ep.id } })
                  }}
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  {t('webhook.list.menu.edit', 'Chỉnh sửa')}
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null)
                    setDeletingWebhook({ id: ep.id, url: ep.url })
                  }}
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  {t('webhook.list.menu.delete', 'Xóa')}
                </button>
              </div>,
              document.body,
            )
          })()}

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
                {logsStatus === 'loading' ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    {t('webhook.list.logs.loading', 'Loading logs...')}
                  </div>
                ) : webhookLogs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    {t('webhook.list.logs.empty', 'No delivery logs yet. Logs will appear when webhook events are sent to your endpoint.')}
                  </div>
                ) : (
                  webhookLogs.map((log, idx) => {
                    const selected = idx === selectedLogIdx
                    return (
                      <button
                        key={log.id}
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
                          <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]" title={log.url}>
                            {log.entityId}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.timeAgo}</span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </Card>

            <div className="lg:col-span-2 bg-slate-950 rounded-xl shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-4 bg-slate-900 flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setViewerTab('response')}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                      viewerTab === 'response'
                        ? 'text-white border-primary'
                        : 'text-slate-400 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    {t('webhook.list.viewer.response', 'Response')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerTab('payload')}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                      viewerTab === 'payload'
                        ? 'text-white border-primary'
                        : 'text-slate-400 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    {t('webhook.list.viewer.payload', 'Payload')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerTab('metadata')}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                      viewerTab === 'metadata'
                        ? 'text-white border-primary'
                        : 'text-slate-400 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    {t('webhook.list.viewer.metadata', 'Metadata')}
                  </button>
                </div>
                <div className="flex gap-2">
                  {viewerContent != null && (
                    <button
                      type="button"
                      className="text-slate-400 hover:text-white transition-colors"
                      onClick={() => void navigator.clipboard.writeText(viewerContent)}
                      title={t('common.copy', 'Copy')}
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                {selectedLog ? (
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                    {viewerContent ?? '(empty)'}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500">
                    {t('webhook.list.viewer.noLogSelected', 'Select a log or logs will appear here when webhooks are delivered.')}
                  </p>
                )}
              </div>
              {selectedLog && (
                <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]" title={selectedLog.url}>
                    {t('webhook.list.viewer.eventId', 'Event ID')}: #{selectedLog.id}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-semibold ${selectedLog.success ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedLog.response_status_code}
                    </span>
                  </div>
                </div>
              )}
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
      {deletingWebhook && (
        <DeleteWebhookModal
          webhookId={deletingWebhook.id}
          endpointUrl={deletingWebhook.url}
          onClose={() => setDeletingWebhook(null)}
        />
      )}
    </AuthenticatedLayout>
  )
}

