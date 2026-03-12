import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchTransactionAccounts,
  fetchTransactionsByAccount,
  setSelectedAccountId,
  type TransactionItem,
} from '../../store/transactionsSlice'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { accounts, items, selectedAccountId, status, error } = useAppSelector((s) => s.transactions)
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'credit' | 'debit'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const loading = status === 'loading'

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchTransactionAccounts())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (selectedAccountId != null) {
      void dispatch(fetchTransactionsByAccount(selectedAccountId))
    }
  }, [dispatch, selectedAccountId])

  useEffect(() => {
    setSelectedTx(items[0] ?? null)
    setPage(1)
  }, [items])

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((tx) => {
      const matchType =
        typeFilter === 'ALL' ? true : tx.type.toLowerCase().includes(typeFilter.toLowerCase())
      const txDate = new Date(tx.occurred_at)
      const afterStart = startDate ? txDate >= new Date(`${startDate}T00:00:00`) : true
      const beforeEnd = endDate ? txDate <= new Date(`${endDate}T23:59:59`) : true
      if (!q) return matchType && afterStart && beforeEnd
      return (
        matchType &&
        afterStart &&
        beforeEnd &&
        [String(tx.id), tx.payment_code, tx.description, tx.type]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    })
  }, [endDate, items, search, startDate, typeFilter])
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page],
  )

  useEffect(() => {
    if (!selectedTx) return
    const stillVisible = filteredItems.some((tx) => tx.id === selectedTx.id)
    if (!stillVisible) {
      setSelectedTx(filteredItems[0] ?? null)
    }
  }, [filteredItems, selectedTx])

  return (
    <AuthenticatedLayout>
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {t('transactions.title', 'Transactions')}
            </h1>
            <p className="text-slate-custom text-sm">
              {t(
                'transactions.subtitle',
                'Track all incoming and outgoing transactions by linked bank account.',
              )}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            {t('transactions.actions.backDashboard', 'Back to dashboard')}
          </Button>
        </div>

        <Card>
          <CardHeader className="px-6">
            <h3 className="font-semibold text-slate-900">
              {t('transactions.filters.title', 'Filters')}
            </h3>
          </CardHeader>
          <CardBody className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  {t('transactions.filters.account', 'Bank account')}
                </label>
                <select
                  value={selectedAccountId ?? ''}
                  onChange={(e) => {
                    const next = Number(e.target.value)
                    dispatch(setSelectedAccountId(Number.isNaN(next) ? null : next))
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {accounts.length === 0 && <option value="">{t('transactions.filters.none', 'No account')}</option>}
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} - •••• {acc.account_number.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex items-end justify-between">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-500">
                      {t('transactions.filters.search', 'Search')}
                    </label>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('transactions.filters.searchPlaceholder', 'ID / payment code / description')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      {t('transactions.filters.type', 'Type')}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'credit' | 'debit')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="ALL">{t('transactions.filters.typeAll', 'ALL')}</option>
                      <option value="credit">{t('transactions.filters.typeCredit', 'CREDIT / IN')}</option>
                      <option value="debit">{t('transactions.filters.typeDebit', 'DEBIT / OUT')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      {t('transactions.filters.fromDate', 'From date')}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      {t('transactions.filters.toDate', 'To date')}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <p className="text-xs text-slate-500 md:col-span-2">
                    {selectedAccount
                      ? t('transactions.filters.selectedHint', {
                          defaultValue: `Showing transactions for ${selectedAccount.bank_name}`,
                          bankName: selectedAccount.bank_name,
                        })
                      : t('transactions.filters.noSelected', 'Select an account to view transactions')}
                  </p>
                  {selectedAccountId != null && (
                    <div className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:underline px-0"
                        onClick={() => void dispatch(fetchTransactionsByAccount(selectedAccountId))}
                      >
                        {t('transactions.filters.refresh', 'Refresh')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 overflow-hidden">
            <CardHeader className="px-6">
              <h3 className="font-semibold text-slate-900">
                {t('transactions.table.title', 'Transaction history')}
              </h3>
            </CardHeader>
            <CardBody className="px-0 py-0">
              <Table>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      {t('transactions.table.id', 'ID')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      {t('transactions.table.type', 'Type')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      {t('transactions.table.occurredAt', 'Occurred at')}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                      {t('transactions.table.amount', 'Amount')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-sm text-slate-500 text-center">
                        {t('transactions.loading', 'Loading transactions...')}
                      </td>
                    </tr>
                  )}
                  {!loading && pagedItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-sm text-slate-500 text-center">
                        {t('transactions.empty', 'No transactions found for this account.')}
                      </td>
                    </tr>
                  )}
                  {pagedItems.map((tx) => {
                    const active = selectedTx?.id === tx.id
                    const outgoing = tx.type.toLowerCase().includes('debit')
                    return (
                      <tr
                        key={tx.id}
                        className={[
                          'cursor-pointer transition-colors',
                          active ? 'bg-primary/5' : 'hover:bg-slate-50',
                        ].join(' ')}
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">#{tx.id}</td>
                        <td className="px-6 py-4">
                          <span
                            className={[
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              outgoing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
                            ].join(' ')}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(tx.occurred_at).toLocaleString()}
                        </td>
                        <td
                          className={[
                            'px-6 py-4 text-sm font-bold text-right',
                            outgoing ? 'text-red-600' : 'text-green-600',
                          ].join(' ')}
                        >
                          {outgoing ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
              {!loading && filteredItems.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {t('transactions.pagination.showing', {
                      defaultValue: `Showing ${(page - 1) * pageSize + 1}-${Math.min(
                        page * pageSize,
                        filteredItems.length,
                      )} of ${filteredItems.length}`,
                      from: (page - 1) * pageSize + 1,
                      to: Math.min(page * pageSize, filteredItems.length),
                      total: filteredItems.length,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t('transactions.pagination.prev', 'Prev')}
                    </Button>
                    <span>
                      {page}/{totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      {t('transactions.pagination.next', 'Next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="px-6">
              <h3 className="font-semibold text-slate-900">
                {t('transactions.detail.title', 'Transaction detail')}
              </h3>
            </CardHeader>
            <CardBody className="px-6 space-y-4">
              {!selectedTx && (
                <p className="text-sm text-slate-500">
                  {t('transactions.detail.empty', 'Choose a transaction to inspect details.')}
                </p>
              )}
              {selectedTx && (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">{t('transactions.table.id', 'ID')}</p>
                    <p className="text-sm font-semibold text-slate-900">#{selectedTx.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">{t('transactions.detail.paymentCode', 'Payment code')}</p>
                    <p className="text-sm font-mono text-slate-700">{selectedTx.payment_code || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">{t('transactions.detail.description', 'Description')}</p>
                    <p className="text-sm text-slate-700">{selectedTx.description || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">{t('transactions.detail.balance', 'Balance')}</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(selectedTx.balance)}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/transactions/${selectedTx.id}`)}
                  >
                    {t('transactions.detail.openPage', 'Open detail page')}
                  </Button>
                </>
              )}
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>
    </AuthenticatedLayout>
  )
}
