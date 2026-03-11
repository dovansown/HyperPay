import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createAccount } from '../../store/accountsSlice'

type AddBankModalProps = {
  onClose: () => void
}

const presetBanks = [
  { id: 'chase', name: 'Chase' },
  { id: 'wells', name: 'Wells Fargo' },
  { id: 'citi', name: 'Citibank' },
  { id: 'capitalone', name: 'Capital One' },
] as const

export const AddBankModal: React.FC<AddBankModalProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((s) => s.accounts)

  const [selectedBank, setSelectedBank] = useState<string | null>(presetBanks[0]?.name ?? null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank || loading) return

    try {
      await dispatch(
        createAccount({
          bankName: selectedBank,
          accountNumber,
          accountHolder,
        }),
      ).unwrap()
      onClose()
    } catch {
      // error handled in slice
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {t('banks.add.title', 'Add bank account')}
            </h3>
            <p className="text-sm text-slate-500">
              {t('banks.add.subtitle', 'Securely link your bank to HyperPay')}
            </p>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                placeholder={t('banks.add.searchPlaceholder', 'Search for your bank...')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {presetBanks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBank(bank.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                    selectedBank === bank.name
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <span className="material-symbols-outlined mb-2 text-slate-500">
                    account_balance
                  </span>
                  {bank.name}
                </button>
              ))}
            </div>

            <div className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t('banks.add.accountHolder', 'Account holder')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder={t(
                    'banks.add.accountHolderPlaceholder',
                    'Enter account holder name',
                  )}
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t('banks.add.accountNumber', 'Account number')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder={t('banks.add.accountNumberPlaceholder', 'Enter account number')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              onClick={onClose}
            >
              {t('banks.add.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? t('banks.add.loading', 'Linking...')
                : t('banks.add.submit', 'Continue to link')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

