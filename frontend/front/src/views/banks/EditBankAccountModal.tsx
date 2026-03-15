import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../store/hooks'
import { updateAccount, type BankAccount } from '../../store/accountsSlice'

type EditBankAccountModalProps = {
  account: BankAccount
  onClose: () => void
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({ account, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [accountHolder, setAccountHolder] = useState(account.account_holder)
  const [accountNumber, setAccountNumber] = useState(account.account_number)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAccountHolder(account.account_holder)
    setAccountNumber(account.account_number)
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await dispatch(
        updateAccount({
          accountId: account.id,
          account_holder: accountHolder.trim(),
          account_number: accountNumber.trim(),
        }),
      ).unwrap()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('banks.edit.error', 'Failed to update account'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {t('banks.edit.title', 'Edit bank account')}
          </h3>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
            aria-label={t('banks.edit.cancel', 'Close')}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('banks.add.accountHolder', 'Account holder')}
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('banks.add.accountNumber', 'Account number')}
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
              onClick={onClose}
            >
              {t('banks.edit.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t('banks.edit.saving', 'Saving...') : t('banks.edit.save', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
