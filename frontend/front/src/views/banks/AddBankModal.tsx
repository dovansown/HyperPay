import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createAccount } from '../../store/accountsSlice'
import { fetchBillingData } from '../../store/billingSlice'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import { TokenDisplayModal } from './TokenDisplayModal'

type AddBankModalProps = {
  onClose: () => void
}

type SupportedBank = {
  id: string
  name: string
  code: string
  icon_url?: string
}

const STEP_TOTAL = 2

export const AddBankModal: React.FC<AddBankModalProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const { status, error } = useAppSelector((s) => s.accounts)

  const [step, setStep] = useState<1 | 2>(1)
  const [banks, setBanks] = useState<SupportedBank[]>([])
  const [bankStatus, setBankStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle')
  const [bankError, setBankError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBank, setSelectedBank] = useState<SupportedBank | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  useEffect(() => {
    if (bankStatus !== 'idle') return
    setBankStatus('loading')
    setBankError(null)
    apiFetch<SupportedBank[] | ApiEnvelope<SupportedBank[]>>('/banks', {
      method: 'GET',
      token: token ?? undefined,
    })
      .then((res) => {
        setBanks(unwrapApiData(res))
        setBankStatus('succeeded')
      })
      .catch((e) => {
        setBankStatus('failed')
        setBankError(
          e instanceof Error ? e.message : t('banks.supported.errorLoad', 'Failed to load banks'),
        )
      })
  }, [bankStatus, token, t])

  useEffect(() => {
    if (bankStatus === 'succeeded' && banks.length > 0 && !selectedBank) {
      setSelectedBank(banks[0])
    }
  }, [bankStatus, banks, selectedBank])

  const filteredBanks = searchQuery.trim()
    ? banks.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          b.code.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : banks

  const loading = status === 'loading'
  const banksLoading = bankStatus === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank || loading) return
    try {
      const { token: newToken } = await dispatch(
        createAccount({
          bankName: selectedBank.name,
          accountNumber,
          accountHolder,
        }),
      ).unwrap()
      void dispatch(fetchBillingData())
      setCreatedToken(newToken)
    } catch {
      // error handled in slice
    }
  }

  const handleTokenModalClose = () => {
    setCreatedToken(null)
    onClose()
  }

  const canGoNext = !banksLoading && selectedBank !== null

  const stepContent = (
    <div
      className="flex w-[200%] flex-shrink-0 transition-transform duration-300 ease-out"
      style={{ transform: `translateX(-${(step - 1) * 50}%)` }}
    >
      {/* Step 1 panel */}
      <div className="w-1/2 flex flex-col flex-shrink-0">
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700">
            {t('banks.add.step1Title', 'Choose your bank')}
          </h4>
        </div>
        <div className="px-6 py-6 space-y-4 flex-1 min-h-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  placeholder={t('banks.add.searchPlaceholder', 'Search for your bank...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {banksLoading && (
                <div className="py-8 text-sm text-slate-500 text-center">
                  {t('banks.supported.loading', 'Loading banks...')}
                </div>
              )}
              {bankStatus === 'failed' && bankError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {bankError}
                </div>
              )}
              {!banksLoading && bankStatus !== 'failed' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredBanks.length === 0 ? (
                    <p className="col-span-full text-sm text-slate-500 py-6 text-center">
                      {searchQuery.trim()
                        ? t('banks.add.noResults', 'No banks match your search.')
                        : t('banks.add.noBanks', 'No supported banks available.')}
                    </p>
                  ) : (
                    filteredBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                          selectedBank?.id === bank.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        {bank.icon_url ? (
                          <img
                            src={bank.icon_url}
                            alt={bank.name}
                            className="w-8 h-8 rounded object-cover border border-slate-200 mb-2"
                          />
                        ) : (
                          <span className="material-symbols-outlined mb-2 text-slate-500">
                            account_balance
                          </span>
                        )}
                        <span>{bank.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase mt-0.5">
                          {bank.code}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
          <button
            type="button"
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            {t('banks.add.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canGoNext}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t('banks.add.next', 'Next')}
          </button>
        </div>
      </div>

      {/* Step 2 panel */}
      <div className="w-1/2 flex flex-col flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <h4 className="text-sm font-semibold text-slate-700">
              {t('banks.add.step2Title', 'Account details')}
            </h4>
            {selectedBank && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                {selectedBank.icon_url ? (
                  <img
                    src={selectedBank.icon_url}
                    alt={selectedBank.name}
                    className="w-6 h-6 rounded object-cover border border-slate-200"
                  />
                ) : (
                  <span className="material-symbols-outlined text-lg text-slate-400">
                    account_balance
                  </span>
                )}
                <span>{selectedBank.name}</span>
                <span className="text-xs uppercase">{selectedBank.code}</span>
              </div>
            )}
          </div>
          <div className="px-6 py-6 space-y-4 flex-1">
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
                placeholder={t(
                  'banks.add.accountNumberPlaceholder',
                  'Enter account number',
                )}
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
          </div>
          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              onClick={() => setStep(1)}
            >
              {t('banks.add.back', 'Back')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || !selectedBank}
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

  if (createdToken) {
    return (
      <TokenDisplayModal
        token={createdToken}
        title={t('banks.tokenModal.newAccountTitle', 'API Token – Lưu ngay')}
        message={t(
          'banks.tokenModal.showOnceCreate',
          'Token chỉ hiển thị một lần khi tạo tài khoản. Hãy copy và lưu lại để dùng cho API.',
        )}
        onClose={handleTokenModalClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-[800px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {t('banks.add.title', 'Add bank account')}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('banks.add.subtitle', 'Securely link your bank to HyperPay')} ·{' '}
                {t('banks.add.step', 'Step {{current}} of {{total}}', {
                  current: step,
                  total: STEP_TOTAL,
                })}
              </p>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors"
              onClick={onClose}
              aria-label={t('banks.add.cancel', 'Cancel')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="overflow-hidden min-h-0 flex-1 flex flex-col">
            {stepContent}
          </div>
        </div>
      </div>
  )
}
