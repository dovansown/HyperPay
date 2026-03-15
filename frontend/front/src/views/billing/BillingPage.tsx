import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBillingData, topUpBalance } from '../../store/billingSlice'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { PurchasePackageModal } from './PurchasePackageModal'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export const BillingPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { activePackages, balanceVnd, packages, status, topUpStatus, error } =
    useAppSelector((s) => s.billing)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)

  useEffect(() => {
    void dispatch(fetchBillingData())
  }, [dispatch])

  const loading = status === 'loading'

  return (
    <AuthenticatedLayout>
      <section className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">
            {t('billing.title', 'Billing Settings')}
          </h1>
          <p className="text-slate-custom text-sm md:text-base">
            {t(
              'billing.subtitle',
              'Manage your package, usage quotas, and available plans from real backend data.',
            )}
          </p>
        </header>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3">progress_activity</span>
            <p className="text-sm">{t('billing.loading', 'Loading billing...')}</p>
          </div>
        )}

        {!loading && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {t('billing.balance.title', 'Balance')}
                    </h3>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(balanceVnd)}</p>
                  </div>
                  <div className="flex gap-2 items-end">
                    <input
                      type="number"
                      min={1}
                      placeholder={t('billing.balance.placeholder', 'Amount (VND)')}
                      className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button
                      size="sm"
                      loading={topUpStatus === 'loading'}
                      disabled={!topUpAmount || parseInt(topUpAmount, 10) < 1}
                      onClick={() => {
                        const n = parseInt(topUpAmount, 10)
                        if (n < 1) return
                        void dispatch(topUpBalance(n)).then(() => {
                          setTopUpAmount('')
                          void dispatch(fetchBillingData())
                        })
                      }}
                    >
                      {t('billing.balance.topUp', 'Top up')}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                      {t('billing.plan.activeBadge', 'ACTIVE')}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {activePackages.length > 0
                        ? t('billing.plan.myPackages', 'My packages ({{count}})', { count: activePackages.length })
                        : t('billing.plan.none', 'No active package')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {activePackages.length > 0
                        ? t('billing.plan.selectHintMultiple', 'You can purchase more packages. Limits add up.')
                        : t('billing.plan.selectHint', 'Buy a package to get started.')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void dispatch(fetchBillingData())}>
                      {t('billing.plan.refresh', 'Refresh')}
                    </Button>
                    <Button onClick={() => setPurchaseModalOpen(true)}>
                      {t('billing.modal.buyPackage', 'Buy package')}
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 space-y-2">
                  {activePackages.length > 0 ? (
                    activePackages.map((ap) => (
                      <div key={ap.id} className="text-sm text-slate-700 flex justify-between items-center">
                        <span>
                          {ap.package.name} · {t('billing.plan.startAt', 'Start')}{' '}
                          {new Date(ap.start_at).toLocaleDateString()} → {t('billing.plan.endAt', 'End')}{' '}
                          {new Date(ap.end_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-700">
                      {t(
                        'billing.plan.noActive',
                        'You do not have an active package. Top up balance and buy a package.',
                      )}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardBody className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('billing.usage.title', 'Usage')}
                </h3>
                {activePackages.length > 0 ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('billing.usage.transactions', 'Transactions')}</span>
                      <span className="text-slate-900 font-medium">
                        {activePackages.reduce((s, ap) => s + ap.usage.transactions, 0)} /{' '}
                        {activePackages.every((ap) => ap.limits.is_unlimited_transactions)
                          ? '∞'
                          : activePackages.reduce((s, ap) => s + (ap.limits.transactions ?? 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {t('billing.usage.webhookDeliveries', 'Webhook deliveries')}
                      </span>
                      <span className="text-slate-900 font-medium">
                        {activePackages.reduce((s, ap) => s + ap.usage.webhook_deliveries, 0)} /{' '}
                        {activePackages.every((ap) => ap.limits.is_unlimited_webhook_deliveries)
                          ? '∞'
                          : activePackages.reduce((s, ap) => s + (ap.limits.webhook_deliveries ?? 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('billing.usage.bankTypes', 'Bank types')}</span>
                      <span className="text-slate-900 font-medium">
                        {(activePackages[0]?.usage.bank_types ?? 0)} /{' '}
                        {activePackages.every((ap) => ap.limits.is_unlimited_bank_types)
                          ? '∞'
                          : activePackages.reduce((s, ap) => s + (ap.limits.bank_types ?? 0), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      {t('billing.usage.fromPackages', 'Sum of {{count}} package(s)', {
                        count: activePackages.length,
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('billing.usage.transactions', 'Transactions')}</span>
                      <span className="text-slate-900 font-medium">0 / –</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {t('billing.usage.webhookDeliveries', 'Webhook deliveries')}
                      </span>
                      <span className="text-slate-900 font-medium">0 / –</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('billing.usage.bankTypes', 'Bank types')}</span>
                      <span className="text-slate-900 font-medium">0 / –</span>
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      {t('billing.usage.noPackage', 'No package yet. Buy a package to get quotas.')}
                    </p>
                  </>
                )}
              </CardBody>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-primary font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined">support_agent</span>
                  {t('billing.help.title', 'Need help?')}
                </h4>
                <p className="text-xs text-slate-600">
                  {t(
                    'billing.help.description',
                    'Have questions about your billing or want to cancel? Contact our support team.',
                  )}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => void dispatch(fetchBillingData())}
                >
                  {t('billing.help.refresh', 'Refresh billing data')}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {t('billing.packages.catalogTitle', 'Package catalog')}
            </h3>
          </div>
          <Card className="overflow-hidden border-primary/10">
            <Table>
              <thead>
                <tr className="border-b border-primary/10 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.plans.columns.name', 'Name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.packages.pricePerMonth', 'Price/month')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.plans.columns.maxTransactions', 'Max transactions')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.packages.banks', 'Banks')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{pkg.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatCurrency(pkg.price_vnd)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {pkg.is_unlimited_transactions
                        ? '∞'
                        : pkg.max_transactions ?? '–'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {pkg.banks && pkg.banks.length > 0
                        ? pkg.banks
                            .map((b) => `${b.name || b.code}: ${b.account_limit}`)
                            .join(', ')
                        : '–'}
                    </td>
                  </tr>
                ))}
                {!loading && packages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-sm text-slate-500 text-center">
                      {t('billing.packages.empty', 'No packages available.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </section>
        </>
        )}

        <PurchasePackageModal
          open={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          onSuccess={() => void dispatch(fetchBillingData())}
        />
      </section>
    </AuthenticatedLayout>
  )
}

