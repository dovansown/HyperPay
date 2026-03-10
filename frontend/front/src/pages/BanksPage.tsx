import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import { useAccountsStore } from '../store/accountsStore'

function maskAccount(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber
  return `•••• ${accountNumber.slice(-4)}`
}

function BanksPage() {
  const { accounts, isLoading, error, fetchAccounts, createAccount, clearError } = useAccountsStore()
  const [openModal, setOpenModal] = useState(false)
  const [bankName, setBankName] = useState('')
  const [holderName, setHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    void fetchAccounts()
  }, [fetchAccounts])

  const accountRows = useMemo(() => {
    if (accounts.length > 0) {
      return accounts.map((account) => ({
        id: account.id,
        bank: account.bank_name,
        type: 'Checking',
        number: maskAccount(account.account_number),
        status: 'Active',
      }))
    }
    return [
      { id: 1, bank: 'JPMorgan Chase', type: 'Checking', number: '•••• 4242', status: 'Active' },
      { id: 2, bank: 'Bank of America', type: 'Savings', number: '•••• 8899', status: 'Pending' },
    ]
  }, [accounts])

  const onCreateBankAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    try {
      await createAccount({
        bank_name: bankName,
        account_holder: holderName,
        account_number: accountNumber,
      })
      setOpenModal(false)
      setBankName('')
      setHolderName('')
      setAccountNumber('')
    } catch {
      // lỗi hiển thị từ store
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Bank accounts</h1>
            <p className="mt-2 max-w-2xl text-slate-500">Add and manage the bank accounts used to receive payouts and pay for HyperPay services.</p>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-lg">account_balance</span>
            Add bank account
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Bank Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Account number</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 text-sm font-medium">{row.bank}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{row.number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.type}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold">Add bank account</h3>
                <p className="text-sm text-slate-500">Securely link your bank to HyperPay</p>
              </div>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={onCreateBankAccount} className="space-y-4 px-6 py-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Bank name</span>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                  placeholder="VD: Vietcombank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Account holder</span>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                  placeholder="VD: Nguyen Van A"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Account number</span>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                  placeholder="Nhập số tài khoản"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  {isLoading ? 'Đang lưu...' : 'Continue to Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}

export default BanksPage
