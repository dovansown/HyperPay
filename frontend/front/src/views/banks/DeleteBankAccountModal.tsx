import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../store/hooks'
import { deleteAccount, type BankAccount } from '../../store/accountsSlice'
import { fetchBillingData } from '../../store/billingSlice'

type DeleteBankAccountModalProps = {
  account: BankAccount
  bankLabel?: string
  onClose: () => void
}

export const DeleteBankAccountModal: React.FC<DeleteBankAccountModalProps> = ({
  account,
  bankLabel,
  onClose,
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await dispatch(deleteAccount(account.id)).unwrap()
      void dispatch(fetchBillingData())
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('banks.delete.error', 'Failed to delete account'))
    } finally {
      setLoading(false)
    }
  }

  const label = bankLabel ?? account.bank_name

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {t('banks.delete.title', 'Remove bank account')}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            {t('banks.delete.confirmMessage', 'Are you sure you want to remove this account?')}{' '}
            <strong>{label}</strong> – {account.account_holder} (•••• {account.account_number.slice(-4)}).
          </p>
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
              {t('banks.delete.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? t('banks.delete.deleting', 'Removing...') : t('banks.delete.confirm', 'Remove')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
