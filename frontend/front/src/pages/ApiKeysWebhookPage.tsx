import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import { useWebhookStore } from '../store/webhookStore'

function ApiKeysWebhookPage() {
  const { config, isLoading, error, fetchConfig, upsertConfig, clearError } = useWebhookStore()
  const [url, setUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    void fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    if (!config) return
    setUrl(config.url)
    setSecret(config.secret_token)
    setActive(config.is_active)
  }, [config])

  const onSaveWebhook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    try {
      await upsertConfig({ url, secret_token: secret, is_active: active })
    } catch {
      // lỗi hiển thị qua store
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Developers</h1>
          <p className="mt-2 text-slate-500">Nội dung kết hợp từ `apikey.html` và `webhook.html`, bỏ toàn bộ sidebar/header của từng file.</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">API keys</h2>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-center">
              <span className="text-sm font-semibold text-slate-500">Publishable key</span>
              <code className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">pk_live_51MxtH0C9z...L45K</code>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-center">
              <span className="text-sm font-semibold text-slate-500">Secret key</span>
              <code className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs italic text-slate-500">••••••••••••••••••••••••••••</code>
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">Reveal</button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Webhook endpoint</h2>
          <form className="space-y-4" onSubmit={onSaveWebhook}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">Endpoint URL</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                placeholder="https://api.example.com/webhook"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">Signing Secret</span>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                placeholder="whsec_..."
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary" />
              Kích hoạt endpoint
            </label>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {isLoading ? 'Đang lưu...' : 'Save webhook config'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AuthenticatedLayout>
  )
}

export default ApiKeysWebhookPage
