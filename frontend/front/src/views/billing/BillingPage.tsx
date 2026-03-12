import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBillingData, purchasePackage } from '../../store/billingSlice'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

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
  const { activePackage, packages, plans, status, purchaseStatus, error } = useAppSelector((s) => s.billing)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchBillingData())
    }
  }, [dispatch, status])

  const loading = status === 'loading'
  const purchasing = purchaseStatus === 'loading'

  return (
    <AuthenticatedLayout>
      <section className="max-w-5xl mx-auto space-y-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                      {t('billing.plan.activeBadge', 'ACTIVE')}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {activePackage?.package.name ?? t('billing.plan.none', 'No active package')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {activePackage
                        ? `${formatCurrency(activePackage.package.price_vnd)} / ${activePackage.package.duration_days} ${t(
                            'billing.common.days',
                            'days',
                          )}`
                        : t('billing.plan.selectHint', 'Choose a package below to activate subscription')}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => void dispatch(fetchBillingData())}>
                    {t('billing.plan.refresh', 'Refresh')}
                  </Button>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    {activePackage ? (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>
                          {t('billing.plan.startAt', 'Start')}: {new Date(activePackage.start_at).toLocaleString()}
                        </p>
                        <p>
                          {t('billing.plan.endAt', 'End')}: {new Date(activePackage.end_at).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700">
                        {t(
                          'billing.plan.noActive',
                          'You do not have an active package. Purchase one from the list below.',
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="px-6">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('billing.packages.title', 'Available Packages')}
                </h3>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const isCurrent = activePackage?.package_id === pkg.id
                    const canPurchase = pkg.status === 'ACTIVE' && !activePackage
                    return (
                      <div
                        key={pkg.id}
                        className={[
                          'rounded-xl border p-4',
                          isCurrent ? 'border-primary/50 bg-primary/5' : 'border-slate-200 bg-white',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{pkg.name}</p>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(pkg.price_vnd)} / {pkg.duration_days} {t('billing.common.days', 'days')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                pkg.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-100 text-slate-600',
                              ].join(' ')}
                            >
                              {pkg.status}
                            </span>
                            {isCurrent ? (
                              <span className="text-xs text-primary font-semibold">
                                {t('billing.packages.current', 'Current')}
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                disabled={!canPurchase}
                                loading={purchasing}
                                onClick={() => {
                                  if (!canPurchase) return
                                  void dispatch(purchasePackage(pkg.id)).then(() => {
                                    void dispatch(fetchBillingData())
                                  })
                                }}
                              >
                                {t('billing.packages.purchase', 'Purchase')}
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          {pkg.description || t('billing.packages.noDescription', 'No description')}
                        </p>
                      </div>
                    )
                  })}
                  {!loading && packages.length === 0 && (
                    <p className="text-sm text-slate-500">
                      {t('billing.packages.empty', 'No packages available.')}
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
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('billing.usage.transactions', 'Transactions')}</span>
                  <span className="text-slate-900 font-medium">
                    {activePackage
                      ? `${activePackage.usage.transactions} / ${activePackage.limits.transactions ?? '∞'}`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t('billing.usage.webhookDeliveries', 'Webhook deliveries')}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {activePackage
                      ? `${activePackage.usage.webhook_deliveries} / ${
                          activePackage.limits.webhook_deliveries ?? '∞'
                        }`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('billing.usage.bankTypes', 'Bank types')}</span>
                  <span className="text-slate-900 font-medium">
                    {activePackage
                      ? `${activePackage.usage.bank_types} / ${activePackage.limits.bank_types ?? '∞'}`
                      : '-'}
                  </span>
                </div>
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
              {t('billing.plans.title', 'Plans Catalog')}
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
                    {t('billing.plans.columns.price', 'Price')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.plans.columns.maxBankAccounts', 'Max bank accounts')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.plans.columns.maxTransactions', 'Max transactions')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.plans.columns.duration', 'Duration')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{plan.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatCurrency(plan.price_vnd)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{plan.max_bank_accounts}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{plan.max_transactions}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {plan.duration_days} {t('billing.common.days', 'days')}
                    </td>
                  </tr>
                ))}
                {!loading && plans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-sm text-slate-500 text-center">
                      {t('billing.plans.empty', 'No plans available.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </section>
      </section>
    </AuthenticatedLayout>
  )
}

