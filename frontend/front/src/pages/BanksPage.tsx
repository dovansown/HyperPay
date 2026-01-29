import { useEffect, useMemo, useState } from 'react'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import { useAccountsStore } from '../store/accountsStore'
import { useBanksStore } from '../store/banksStore'
import AddBankWizardModal from '../components/banks/AddBankWizardModal'

function maskAccountNumber(accountNumber: string) {
  const cleaned = accountNumber ?? ''
  if (cleaned.length <= 4) return cleaned
  return `**** ${cleaned.slice(-4)}`
}

export function BanksPage() {
  const { accounts, fetchAccounts, createAccount, isLoading, error, clearError } =
    useAccountsStore()
  const { banks, fetchBanks } = useBanksStore()

  const [isAddOpen, setIsAddOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
    fetchBanks()
  }, [fetchAccounts, fetchBanks])

  const total = accounts.length

  const bankOptions = useMemo(() => {
    const fromApi = banks
      .map((b) => ({ code: b.code, name: b.name }))
      .filter((x) => x.code && x.name)
    if (fromApi.length) return fromApi
    // fallback theo design
    return [
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'TCB', name: 'Techcombank' },
      { code: 'MB', name: 'MB Bank' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'VTB', name: 'Vietinbank' },
    ]
  }, [banks])

  const handleSubmit = async (payload: {
    bank_name: string
    account_number: string
    account_holder: string
  }) => {
    clearError()
    try {
      await createAccount(payload)
      setIsAddOpen(false)
    } catch {
      // error trong store
    }
  }

  return (
    <AuthenticatedLayout containerClassName="max-w-[1300px] mx-auto w-full px-6 lg:px-10 py-8">
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
          Kết nối ngân hàng
        </span>
      </nav>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight">Tài khoản đã liên kết</h2>
        <button className="text-sm font-bold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
          Xem tất cả lịch sử
        </button>
      </div>

      {error && <p className="text-sm text-red-500 font-medium mb-4">{error}</p>}

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white dark:bg-[#1a180b] rounded-lg p-6 border-2 border-transparent hover:border-primary transition-all group shadow-sm hover:shadow-xl cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="size-14 rounded-2xl bg-white shadow-md p-2 flex items-center justify-center overflow-hidden border border-[#f0efea]">
                <span className="material-symbols-outlined text-[#181710]">account_balance</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-extrabold uppercase px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                  Hoạt động
                </span>
                <button className="text-[#8d865e] hover:text-[#181710] dark:hover:text-white">
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{acc.bank_name}</h3>
              <p className="text-[#8d865e] text-sm font-medium">
                STK: {maskAccountNumber(acc.account_number)}
              </p>
            </div>
            <div className="pt-4 border-t border-[#f5f4f0] dark:border-[#2d2a1a] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8d865e] font-bold uppercase tracking-tight">
                  Cập nhật lúc
                </span>
                <span className="text-xs font-semibold">—</span>
              </div>
              <button
                className="size-9 rounded-full bg-[#f5f4f0] dark:bg-[#2d2a1a] group-hover:bg-primary transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault()
                  fetchAccounts()
                }}
              >
                <span className="material-symbols-outlined text-base">sync</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Account Card */}
        <button
          className="bg-transparent rounded-lg p-6 border-2 border-dashed border-[#e7e5da] dark:border-[#3d3a2a] hover:border-primary hover:bg-white dark:hover:bg-[#1a180b] transition-all flex flex-col items-center justify-center min-h-[220px] text-center cursor-pointer group"
          onClick={() => setIsAddOpen(true)}
        >
          <div className="size-14 rounded-full bg-[#f5f4f0] dark:bg-[#2d2a1a] group-hover:bg-primary transition-colors flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-xl group-hover:text-[#181710]">
              add
            </span>
          </div>
          <h3 className="text-base font-bold">Thêm tài khoản mới</h3>
          <p className="text-[#8d865e] text-sm mt-1">Hỗ trợ hơn 30+ ngân hàng tại VN</p>
        </button>
      </div>

      {/* Sync Now Global CTA */}
      <div className="mt-12 bg-primary rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/20">
        <div className="text-center md:text-left">
          <h2 className="text-[#181710] text-xl font-black mb-2">
            Đồng bộ tất cả dữ liệu?
          </h2>
          <p className="text-[#181710]/70 font-medium">
            Chúng tôi sẽ cập nhật số dư và lịch sử giao dịch từ tất cả{' '}
            {String(total).padStart(2, '0')} tài khoản.
          </p>
        </div>
        <button
          className="bg-[#181710] text-white hover:bg-black px-10 py-4 rounded-full font-black text-base transition-transform hover:scale-105 flex items-center gap-3"
          onClick={() => fetchAccounts()}
        >
          <span className="material-symbols-outlined">bolt</span>
          Đồng bộ ngay
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <p className="text-[#8d865e] text-sm font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">verified_user</span>
          Dữ liệu được bảo mật bởi chuẩn mã hóa AES-256.
        </p>
      </div>

      <AddBankWizardModal
        isOpen={isAddOpen}
        bankOptions={bankOptions}
        isSubmitting={isLoading}
        error={error}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSubmit}
      />
    </AuthenticatedLayout>
  )
}

export default BanksPage

