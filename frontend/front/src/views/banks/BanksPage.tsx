import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAccounts } from '../../store/accountsSlice'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import { AddBankModal } from './AddBankModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'

type SupportedBank = {
  id: number
  name: string
  code: string
  icon_url?: string
}

export const BanksPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const { items, status } = useAppSelector((s) => s.accounts)
  const [showAdd, setShowAdd] = useState(false)
  const [banks, setBanks] = useState<SupportedBank[]>([])
  const [bankStatus, setBankStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle')
  const [bankError, setBankError] = useState<string | null>(null)
  const [newBankName, setNewBankName] = useState('')
  const [newBankCode, setNewBankCode] = useState('')
  const [newBankIconUrl, setNewBankIconUrl] = useState('')
  const [savingBank, setSavingBank] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchAccounts())
    }
  }, [dispatch, status])

  const loadBanks = async () => {
    setBankStatus('loading')
    setBankError(null)
    try {
      const res = await apiFetch<SupportedBank[] | ApiEnvelope<SupportedBank[]>>('/banks', {
        method: 'GET',
        token: token ?? undefined,
      })
      setBanks(unwrapApiData(res))
      setBankStatus('succeeded')
    } catch (e) {
      setBankStatus('failed')
      setBankError(e instanceof Error ? e.message : t('banks.supported.errorLoad', 'Failed to load banks'))
    }
  }

  useEffect(() => {
    if (bankStatus === 'idle') {
      void loadBanks()
    }
  }, [bankStatus])

  const loading = status === 'loading'

  const resolveBank = (bankNameOrCode: string) => {
    const normalized = bankNameOrCode.trim().toLowerCase()
    return (
      banks.find((b) => b.code.toLowerCase() === normalized) ??
      banks.find((b) => b.name.toLowerCase() === normalized) ??
      null
    )
  }

  const handleCreateBank = async () => {
    setSavingBank(true)
    setBankError(null)
    try {
      await apiFetch('/banks', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: newBankName.trim(),
          code: newBankCode.trim().toUpperCase(),
          icon_url: newBankIconUrl.trim() || undefined,
        },
      })
      setNewBankName('')
      setNewBankCode('')
      setNewBankIconUrl('')
      await loadBanks()
    } catch (e) {
      setBankError(e instanceof Error ? e.message : t('banks.supported.errorCreate', 'Failed to create bank'))
    } finally {
      setSavingBank(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <nav className="flex gap-2 text-xs font-medium text-slate-400 mb-2">
              <span className="hover:text-primary cursor-default">
                {t('banks.breadcrumb.root', 'Settings')}
              </span>
              <span>/</span>
              <span className="text-slate-900">
                {t('banks.breadcrumb.current', 'Bank accounts')}
              </span>
            </nav>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {t('banks.title', 'Bank accounts')}
            </h2>
            <p className="text-slate-custom max-w-lg text-sm">
              {t(
                'banks.subtitle',
                'Add and manage the bank accounts used to receive payouts and pay for HyperPay services.',
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 self-start"
          >
            <span className="material-symbols-outlined text-lg">account_balance</span>
            {t('banks.actions.add', 'Add bank account')}
          </Button>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-8">
            <button className="border-b-2 border-primary text-primary px-1 pb-4 text-sm font-semibold">
              {t('banks.tabs.active', 'Active accounts')}
            </button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('banks.table.columns.bankName', 'Bank name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('banks.table.columns.accountNumber', 'Account number')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('banks.table.columns.holder', 'Account holder')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    {t('banks.table.columns.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-sm text-slate-500 text-center"
                    >
                      {t('banks.table.loading', 'Loading bank accounts...')}
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-sm text-slate-500 text-center"
                    >
                      {t(
                        'banks.table.empty',
                        'No bank accounts added yet. Click “Add bank account” to link your first account.',
                      )}
                    </td>
                  </tr>
                )}
                {items.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {resolveBank(acc.bank_name)?.icon_url ? (
                          <img
                            src={resolveBank(acc.bank_name)?.icon_url}
                            alt={acc.bank_name}
                            className="w-8 h-8 rounded object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-lg">
                              account_balance
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-900">
                          {resolveBank(acc.bank_name)?.name ?? acc.bank_name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {resolveBank(acc.bank_name)?.code ?? acc.bank_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-500 tracking-wider">
                        •••• {acc.account_number.slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{acc.account_holder}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        </Card>

        <Card className="mt-8 bg-primary/5 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                {t('banks.info.verifyTitle', 'Verify new accounts instantly')}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'banks.info.verifyDescription',
                  'Connect your bank via Plaid for instant verification without micro-deposits.',
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:underline px-0">
            {t('banks.info.learnMore', 'Learn more →')}
          </Button>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card>
            <div className="p-6">
            <h4 className="text-sm font-semibold mb-3">
              {t('banks.info.payoutsTitle', 'About payouts')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'banks.info.payoutsDescription',
                'HyperPay sends payouts to your active bank accounts on a rolling 2-day schedule. You can manage your payout schedule in Payout Settings.',
              )}
            </p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
            <h4 className="text-sm font-semibold mb-3">
              {t('banks.info.securityTitle', 'Security & Compliance')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'banks.info.securityDescription',
                "All bank data is encrypted and stored according to PCI-DSS standards. We never store your full bank account numbers on our servers.",
              )}
            </p>
            </div>
          </Card>
        </div>

        <section className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {t('banks.supported.title', 'Supported banks')}
            </h3>
            <Button variant="secondary" size="sm" onClick={() => void loadBanks()}>
              {t('banks.supported.refresh', 'Refresh')}
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('banks.supported.columns.code', 'Code')}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('banks.supported.columns.name', 'Name')}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('banks.supported.columns.icon', 'Icon')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankStatus === 'loading' && (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-sm text-slate-500 text-center">
                      {t('banks.supported.loading', 'Loading banks...')}
                    </td>
                  </tr>
                )}
                {bankStatus !== 'loading' &&
                  banks.map((bank) => (
                    <tr key={bank.id}>
                      <td className="px-6 py-4 text-sm font-mono">{bank.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{bank.name}</td>
                      <td className="px-6 py-4 text-sm">
                        {bank.icon_url ? (
                          <a href={bank.icon_url} target="_blank" rel="noreferrer" className="text-primary underline">
                            {bank.icon_url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card>

          <Card>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                value={newBankCode}
                onChange={(e) => setNewBankCode(e.target.value)}
                placeholder={t('banks.supported.create.codePlaceholder', 'Code (e.g. VCB)')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder={t('banks.supported.create.namePlaceholder', 'Bank name')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={newBankIconUrl}
                onChange={(e) => setNewBankIconUrl(e.target.value)}
                placeholder={t('banks.supported.create.iconPlaceholder', 'Icon URL (optional)')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <Button
                onClick={handleCreateBank}
                loading={savingBank}
                disabled={!newBankCode.trim() || !newBankName.trim()}
              >
                {t('banks.supported.create.submit', 'Create bank')}
              </Button>
            </div>
          </Card>

          {bankError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {bankError}
            </div>
          )}
        </section>
      </section>

      {showAdd && (
        <AddBankModal
          onClose={() => setShowAdd(false)}
        />
      )}
    </AuthenticatedLayout>
  )
}

