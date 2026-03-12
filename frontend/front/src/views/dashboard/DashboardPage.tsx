import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchDashboardData } from '../../store/dashboardSlice'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { totalAccounts, totalPlans, recentTransactions, status } = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchDashboardData())
    }
  }, [dispatch, status])

  const loading = status === 'loading'

  return (
    <AuthenticatedLayout>
      <section className="space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {t('dashboard.title', 'Dashboard Overview')}
          </h1>
          <p className="text-slate-custom text-sm">
            {t(
              'dashboard.subtitle',
              'Monitor balances, revenue, and transactions across your HyperPay account.',
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-custom text-sm font-medium">
                {t('dashboard.cards.totalBalance', 'Total Balance')}
              </span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">
                account_balance
              </span>
            </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {t('dashboard.cards.totalBalanceValue', '$128,430.00')}
                </span>
                <span className="text-green-500 text-xs font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {t('dashboard.cards.totalBalanceTrend', '+12.5% this month')}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-custom text-sm font-medium">
                {t('dashboard.cards.todayRevenue', 'Today Revenue')}
              </span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">
                monitoring
              </span>
            </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {t('dashboard.cards.todayRevenueValue', '$4,250.50')}
                </span>
                <span className="text-green-500 text-xs font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {t('dashboard.cards.todayRevenueTrend', '+8.2% from yesterday')}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-custom text-sm font-medium">
                {t('dashboard.cards.accounts', 'Linked Accounts')}
              </span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">
                account_balance_wallet
              </span>
            </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : totalAccounts}
                </span>
                <span className="text-slate-custom text-xs font-medium mt-1">
                  {t('dashboard.cards.accountsSubtitle', 'Bank accounts connected to HyperPay')}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-custom text-sm font-medium">
                {t('dashboard.cards.plans', 'Active Plans')}
              </span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">
                workspace_premium
              </span>
            </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : totalPlans}
                </span>
                <span className="text-slate-custom text-xs font-medium mt-1">
                  {t('dashboard.cards.plansSubtitle', 'Subscription plans configured')}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-8 overflow-hidden">
          <CardHeader>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t('dashboard.chart.title', 'Revenue over time')}
              </h3>
              <p className="text-slate-custom text-sm">
                {t(
                  'dashboard.chart.subtitle',
                  'Monitor your earnings daily across all channels',
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                7 {t('dashboard.chart.days', 'Days')}
              </Button>
              <Button size="sm">
                30 {t('dashboard.chart.days', 'Days')}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-[260px] w-full relative">
              {/* giữ SVG tĩnh từ design để làm placeholder chart */}
              <svg
                className="w-full h-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 1000 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#645cff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#645cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,250 C100,220 150,280 200,200 C250,120 300,180 350,140 C400,100 450,190 500,160 C550,130 600,60 650,80 C700,100 750,200 800,150 C850,100 900,120 1000,50 L1000,300 L0,300 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,250 C100,220 150,280 200,200 C250,120 300,180 350,140 C400,100 450,190 500,160 C550,130 600,60 650,80 C700,100 750,200 800,150 C850,100 900,120 1000,50"
                  fill="none"
                  stroke="#645cff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">
              {t('dashboard.table.title', 'Latest Transactions')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:underline px-0"
              onClick={() => navigate('/transactions')}
            >
              {t('dashboard.table.viewAll', 'View all')}
            </Button>
          </CardHeader>
          <Table>
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('dashboard.table.columns.id', 'Transaction ID')}
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('dashboard.table.columns.date', 'Date')}
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('dashboard.table.columns.status', 'Status')}
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    {t('dashboard.table.columns.amount', 'Amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.slice(0, 5).map((tx) => (
                  <tr key={String(tx.id ?? Math.random())} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {tx.id ?? t('dashboard.table.unknownId', '#Unknown')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {tx.occurred_at ? new Date(tx.occurred_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {tx.type ?? t('dashboard.table.unknownStatus', 'Unknown')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      {tx.amount != null ? `$${tx.amount}` : '—'}
                    </td>
                  </tr>
                ))}
                {!loading && recentTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-sm text-slate-500 text-center"
                    >
                      {t(
                        'dashboard.table.empty',
                        'No transactions found yet. Start processing payments to see them here.',
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
        </Card>
      </section>
    </AuthenticatedLayout>
  )
}

