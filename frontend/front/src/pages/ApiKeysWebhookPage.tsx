import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Switch from '../components/ui/Switch'
import { Table, Thead, Tbody, Th, Td } from '../components/ui/Table'
import { useAccountsStore } from '../store/accountsStore'
import { useWebhookStore } from '../store/webhookStore'

function maskKey(key?: string) {
  if (!key) return '—'
  if (key.length <= 8) return key
  return `${key.slice(0, 8)}••••••••••••${key.slice(-4)}`
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function ApiKeysWebhookPage() {
  const { accounts, fetchAccounts, refreshAccountToken, isLoading, error } =
    useAccountsStore()
  const {
    config,
    fetchConfig,
    upsertConfig,
    isLoading: webhookLoading,
    error: webhookError,
    clearError: clearWebhookError,
  } = useWebhookStore()

  const [activeAccountId, _setActiveAccountId] = useState<number | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [secretToken, setSecretToken] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchAccounts()
    fetchConfig()
  }, [fetchAccounts, fetchConfig])

  useEffect(() => {
    if (config) {
      setWebhookUrl(config.url ?? '')
      setSecretToken(config.secret_token ?? '')
      setIsActive(Boolean(config.is_active))
    }
  }, [config])

  const activeKeysCount = useMemo(() => accounts.length, [accounts.length])

  const selectedAccount = useMemo(() => {
    if (!activeAccountId) return null
    return accounts.find((a) => a.id === activeAccountId) ?? null
  }, [accounts, activeAccountId])

  const handleGenerate = async () => {
    const id = activeAccountId ?? accounts[0]?.id
    if (!id) return
    await refreshAccountToken(id)
  }

  const handleSaveWebhook = async (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    clearWebhookError()
    try {
      await upsertConfig({
        url: webhookUrl,
        secret_token: secretToken,
        is_active: isActive,
      })
      setSaved(true)
    } catch {
    }
  }

  return (
    <AuthenticatedLayout containerClassName="max-w-[1300px] mx-auto w-full px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6">
        <a
          className="text-[#8d865e] hover:text-[#181710] dark:hover:text-white transition-colors flex items-center gap-1"
          href="#"
        >
          <span className="material-symbols-outlined text-base">home</span>
          <span className="text-sm font-medium leading-none">Trang chủ</span>
        </a>
        <span className="text-[#8d865e] text-sm">/</span>
        <span className="text-[#181710] dark:text-white text-sm font-bold">
          APIs
        </span>
      </nav>

      {/* API Keys Section */}
      <div className="flex flex-col gap-4 mt-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">key</span> API Keys
          </h2>
          <span className="text-sm font-medium text-gray-400">
            {activeKeysCount} API Key
          </span>
        </div>

        {(error || webhookError) && (
          <p className="text-sm text-red-500 font-medium px-2">
            {error ?? webhookError}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col justify-between gap-6 flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    API Key
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">
                    {maskKey(selectedAccount?.api_token)}
                  </span>
                  <button
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    type="button"
                    onClick={async () => {
                      if (!selectedAccount?.api_token) return
                      await copyToClipboard(selectedAccount.api_token)
                    }}
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isLoading || accounts.length === 0}
                >
                  Refresh Key
                </Button>
              </div>
            </div>
            <div
              className="w-full md:w-48 bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
              data-alt="Abstract colorful purple and yellow security pattern"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDlza3TZOwpXAiPfUVskO5v27ktJAjI9viPvj00Yb-VtabMIrt7q77hx1slyPsd9zc48bfEDuDnvBrHClcv9S_otk5jul6dG60eHLb8tHPbTbbcR-lpd5rtgGWHi89zPDjz_DrVZmTT2X-2T7cDY8uM5W_1pewBnMyLWV8QNVwjZ3biKkUPas9WkPx1qc5eJbkoOfSdIAdtequyL7Yt50TQ968Zc3rSqLnwnjkA9VWG3uVvsEb_EDOqQDV8rYzppVAPutjmcnzqGFjx")',
              }}
            />
          </div>

          {/* Card 2 (sandbox style - still using accounts data) */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col justify-between gap-6 flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    External API Endpoint
                  </p>
                </div>
                <p className="text-base font-extrabold">Transactions API</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">
                    GET /api/v1/external/accounts/&lt;ACCOUNT_TOKEN&gt;/transactions
                  </span>
                  <button
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    type="button"
                    onClick={async () =>
                      copyToClipboard(
                        'http://localhost:8080/api/v1/external/accounts/<ACCOUNT_TOKEN>/transactions',
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
              </div>

              <button className="flex items-center justify-center rounded-full h-10 px-6 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold gap-2 hover:bg-primary hover:text-black transition-all w-fit">
                <span className="material-symbols-outlined text-base">description</span>
                Xem tài liệu
              </button>
            </div>
            <div
              className="w-full md:w-48 bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
              data-alt="Abstract blue and yellow code grid pattern"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLRGKGfv0Ws-BXET0iOSelKkdzacEymANX2911gLA4VxdmASL9_lwARDQnV_sr5DTfF6IH48Dcg5FgCfNR8Uh-7fc9RxnJGJ5XhXud57MTSFRMqfHW2IwczZCcvzpgEHTaBLXbDNoOtsEvAyq1dhx1s62Z43bP8KR5h42eAElH5lcd0QUP_KfEXC9DzGFaEgMFxm_t_tblejfJAzWs-w7AR-AZzOEAQgIf16T5WjLibCYRNFB_WtEd_Db7yphbxroRL3XPhUqWhzZT")',
              }}
            />
          </div>
        </div>
      </div>

      {/* Webhook config + Deliveries */}
      <div className="flex flex-col gap-6 mt-12">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span> Webhook
            </h2>
            <p className="text-sm font-medium text-gray-400">
              Tình trạng đồng bộ giao dịch thực tế
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-2 border-gray-200 dark:border-gray-700"
            onClick={() => {
              // focus form area below
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <span className="material-symbols-outlined mr-2 text-base">
              settings_input_component
            </span>
            Thêm endpoint
          </Button>
        </div>

        {/* Webhook configuration form (đấu API /webhook) */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Cấu hình Webhook
            </h3>
            {saved && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e6fcf5] px-3 py-1 text-xs font-bold text-[#0ca678]">
                Đã lưu
              </span>
            )}
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveWebhook}>
            <Input
              label="Webhook URL"
              placeholder="https://your-system.com/webhooks/hyperpay"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              rounded="md"
            />
            <Input
              label="Secret Token"
              placeholder="your-webhook-secret"
              value={secretToken}
              onChange={(e) => setSecretToken(e.target.value)}
              rounded="md"
            />
            <div className="flex items-center justify-between md:col-span-2 rounded-[20px] border border-[#eae5cd] dark:border-gray-800 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Hoạt động</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Bật/tắt webhook gửi sự kiện giao dịch
                </span>
              </div>
              <Switch checked={isActive} onChange={setIsActive} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={webhookLoading} size="sm">
                {webhookLoading ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </div>
          </form>
        </div>

        {/* Deliveries table (UI theo design, dữ liệu demo) */}
        <Table className="text-left">
          <Thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <Th className="text-gray-500">Loại sự kiện</Th>
              <Th className="text-gray-500">Điểm cuối</Th>
              <Th className="text-gray-500">Thời gian</Th>
              <Th className="text-gray-500">Trạng thái</Th>
              <Th className="text-right text-gray-500">Chi tiết</Th>
            </tr>
          </Thead>
          <Tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <Td className="whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    payment.succeeded
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">ID: evt_92k8...</span>
                </div>
              </Td>
              <Td className="whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  api.mystore.com/hooks
                </span>
              </Td>
              <Td className="whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">2 mins ago</span>
              </Td>
              <Td className="whitespace-nowrap">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e6fcf5] px-3 py-1 text-xs font-bold text-[#0ca678]">
                  <span>Webhook gửi thành công 🎯</span>
                </div>
              </Td>
              <Td className="whitespace-nowrap text-right">
                <button className="text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined">data_object</span>
                </button>
              </Td>
            </tr>
          </Tbody>
        </Table>
      </div>

      {/* Help Floating Action Button */}
      <button className="fixed bottom-8 right-8 size-14 bg-black dark:bg-primary text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group">
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
          help_center
        </span>
        <div className="absolute right-16 bg-black text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Cần trợ giúp với APIs?
        </div>
      </button>
    </AuthenticatedLayout>
  )
}

export default ApiKeysWebhookPage

