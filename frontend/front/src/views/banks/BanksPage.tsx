import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchAccounts,
  refreshAccountToken,
  updateAccount,
  deleteAccount,
  clearAccountsError,
  type BankAccount,
} from '../../store/accountsSlice'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import { AddBankModal } from './AddBankModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { EditBankAccountModal } from './EditBankAccountModal'
import { DeleteBankAccountModal } from './DeleteBankAccountModal'
import { TokenDisplayModal } from './TokenDisplayModal'

type SupportedBank = {
  id: string
  name: string
  code: string
  icon_url?: string
}

export const BanksPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const { items, status, error } = useAppSelector((s) => s.accounts)
  const [showAdd, setShowAdd] = useState(false)
  const [banks, setBanks] = useState<SupportedBank[]>([])
  const [bankStatus, setBankStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null)
  const [tokenToShow, setTokenToShow] = useState<string | null>(null)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchAccounts())
    }
  }, [dispatch, status])

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
      const menuEl = document.getElementById('bank-account-menu-portal')
      if (menuEl?.contains(target)) return
      setOpenMenuId(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [openMenuId])

  const handleRefreshToken = useCallback(
    async (accountId: number) => {
      setOpenMenuId(null)
      try {
        const { token } = await dispatch(refreshAccountToken(accountId)).unwrap()
        if (token) setTokenToShow(token)
      } catch {
        // error đã lưu trong slice, UI hiển thị
      }
    },
    [dispatch],
  )

  const loadBanks = async () => {
    setBankStatus('loading')
    try {
      const res = await apiFetch<SupportedBank[] | ApiEnvelope<SupportedBank[]>>('/banks', {
        method: 'GET',
        token: token ?? undefined,
      })
      setBanks(unwrapApiData(res))
      setBankStatus('succeeded')
    } catch {
      setBankStatus('failed')
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

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              className="text-red-400 hover:text-red-600"
              onClick={() => dispatch(clearAccountsError())}
              aria-label={t('banks.dismissError', 'Dismiss')}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

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
                        ref={openMenuId === acc.id ? menuTriggerRef : undefined}
                        type="button"
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === acc.id ? null : acc.id)
                        }}
                        aria-haspopup="true"
                        aria-expanded={openMenuId === acc.id}
                      >
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        </Card>

        {openMenuId !== null && menuAnchor && (() => {
          const acc = items.find((a) => a.id === openMenuId)
          if (!acc) return null
          return createPortal(
            <div
              id="bank-account-menu-portal"
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
                  setEditingAccount(acc)
                }}
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                {t('banks.menu.edit', 'Edit')}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                role="menuitem"
                onClick={() => handleRefreshToken(acc.id)}
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                {t('banks.menu.regenerateToken', 'Regenerate token')}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null)
                  setDeletingAccount(acc)
                }}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                {t('banks.menu.delete', 'Delete')}
              </button>
            </div>,
            document.body,
          )
        })()}

        <Card className="mt-8 bg-primary/5 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 p-6">
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
      </section>

      {showAdd && <AddBankModal onClose={() => setShowAdd(false)} />}
      {editingAccount && (
        <EditBankAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
      {deletingAccount && (
        <DeleteBankAccountModal
          account={deletingAccount}
          bankLabel={resolveBank(deletingAccount.bank_name)?.name ?? deletingAccount.bank_name}
          onClose={() => setDeletingAccount(null)}
        />
      )}
      {tokenToShow && (
        <TokenDisplayModal
          token={tokenToShow}
          title={t('banks.tokenModal.regenerateTitle', 'API Token mới')}
          message={t(
            'banks.tokenModal.showOnceRegenerate',
            'Token chỉ hiển thị một lần khi tạo lại. Hãy copy và lưu lại.',
          )}
          onClose={() => setTokenToShow(null)}
        />
      )}
    </AuthenticatedLayout>
  )
}

