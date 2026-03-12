import React, { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchTransactionAccounts,
  fetchTransactionsByAccount,
  setSelectedAccountId,
} from '../../store/transactionsSlice'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const TransactionDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const { accounts, items, selectedAccountId, status } = useAppSelector((s) => s.transactions)

  const txId = Number(id)
  const accountIdFromQuery = Number(searchParams.get('accountId'))

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchTransactionAccounts())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (!Number.isNaN(accountIdFromQuery) && accountIdFromQuery > 0) {
      dispatch(setSelectedAccountId(accountIdFromQuery))
    }
  }, [accountIdFromQuery, dispatch])

  useEffect(() => {
    if (selectedAccountId != null) {
      void dispatch(fetchTransactionsByAccount(selectedAccountId))
    }
  }, [dispatch, selectedAccountId])

  const tx = useMemo(() => items.find((x) => x.id === txId) ?? null, [items, txId])
  const account = useMemo(
    () => accounts.find((x) => x.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )

  return (
    <AuthenticatedLayout>
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">
            {t('transactions.detail.pageTitle', 'Transaction detail')}
          </h1>
          <Button variant="secondary" onClick={() => navigate('/transactions')}>
            {t('transactions.detail.back', 'Back')}
          </Button>
        </div>

        {!tx && (
          <Card>
            <CardBody className="p-6 text-sm text-slate-600">
              {t(
                'transactions.detail.notFound',
                'Transaction was not found in the selected account. Choose another account from the transactions page.',
              )}
            </CardBody>
          </Card>
        )}

        {tx && (
          <Card>
            <CardHeader className="px-6">
              <h3 className="font-semibold text-slate-900">#{tx.id}</h3>
            </CardHeader>
            <CardBody className="px-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">{t('transactions.table.type', 'Type')}</p>
                  <p className="font-medium text-slate-900">{tx.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('transactions.table.amount', 'Amount')}</p>
                  <p className="font-medium text-slate-900">{formatCurrency(tx.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('transactions.detail.paymentCode', 'Payment code')}</p>
                  <p className="font-mono text-slate-800">{tx.payment_code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('transactions.detail.balance', 'Balance')}</p>
                  <p className="font-medium text-slate-900">{formatCurrency(tx.balance)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">{t('transactions.table.occurredAt', 'Occurred at')}</p>
                  <p className="font-medium text-slate-900">{new Date(tx.occurred_at).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">{t('transactions.detail.description', 'Description')}</p>
                  <p className="text-slate-800">{tx.description || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">{t('transactions.filters.account', 'Bank account')}</p>
                  <p className="text-slate-800">
                    {account ? `${account.bank_name} - •••• ${account.account_number.slice(-4)}` : '-'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </section>
    </AuthenticatedLayout>
  )
}
