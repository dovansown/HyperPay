import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchDashboardData, setChartPeriod } from '../../store/dashboardSlice'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    totalAccounts,
    totalPlans,
    totalBalanceVnd,
    todayRevenueVnd,
    chartData,
    chartPeriod,
    recentTransactions,
    status,
    error,
  } = useAppSelector((s) => s.dashboard)

  const loadDashboard = useCallback(
    (period: 7 | 30) => {
      void dispatch(fetchDashboardData({ period }))
    },
    [dispatch],
  )

  useEffect(() => {
    if (status === 'idle') {
      loadDashboard(chartPeriod)
    }
  }, [status, chartPeriod, loadDashboard])

  const handlePeriodChange = (period: 7 | 30) => {
    dispatch(setChartPeriod(period))
    loadDashboard(period)
  }

  const loading = status === 'loading'
  const failed = status === 'failed'

  return (
    <AuthenticatedLayout>
      <section className="max-w-6xl mx-auto space-y-8">
        {failed && (
          <div
            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800"
            role="alert"
          >
            <p className="text-sm font-medium">{error ?? t('dashboard.errorLoad')}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadDashboard(chartPeriod)}
            >
              {t('common.retry')}
            </Button>
          </div>
        )}
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
                  {loading ? '—' : formatVnd(totalBalanceVnd)}
                </span>
                <span className="text-slate-custom text-xs font-medium mt-1">
                  {t('dashboard.cards.totalBalanceSubtitle')}
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
                  {loading ? '—' : formatVnd(todayRevenueVnd)}
                </span>
                <span className="text-slate-custom text-xs font-medium mt-1">
                  {t('dashboard.cards.todayRevenueSubtitle')}
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
              <Button
                variant={chartPeriod === 7 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handlePeriodChange(7)}
              >
                7 {t('dashboard.chart.days', 'Days')}
              </Button>
              <Button
                variant={chartPeriod === 30 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handlePeriodChange(30)}
              >
                30 {t('dashboard.chart.days', 'Days')}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-[260px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary, #645cff)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--color-primary, #645cff)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      interval={chartPeriod === 7 ? 0 : 'preserveStartEnd'}
                      tickMargin={8}
                    />
                    <YAxis
                      hide
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value) => [formatVnd(Number(value ?? 0)), t('dashboard.chart.revenue')]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-primary, #645cff)"
                      strokeWidth={2.5}
                      fill="url(#chartFill)"
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  {loading
                    ? t('dashboard.chart.loading')
                    : t('dashboard.chart.noData')}
                </div>
              )}
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
                    {tx.amount != null ? formatVnd(tx.amount) : '—'}
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
