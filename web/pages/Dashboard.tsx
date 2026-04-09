import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown } from '@/components/ui/Dropdown';
import { RecentActivityTable } from '@/components/sections/RecentActivityTable';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  ChevronDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Copy,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboard, setPeriod } from '@/store/slices/dashboardSlice';

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function Dashboard() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { data, period, status, error } = useAppSelector((s) => s.dashboard);

  const [activityFilter, setActivityFilter] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [cashflowFilter, setCashflowFilter] = useState<'week' | 'month' | 'year'>('week');

  const effectivePeriod: 7 | 30 = cashflowFilter === 'month' || cashflowFilter === 'year' ? 30 : 7;

  useEffect(() => {
    dispatch(setPeriod(effectivePeriod));
    void dispatch(fetchDashboard({ period: effectivePeriod }));
  }, [dispatch, effectivePeriod]);

  const chartData = useMemo(() => {
    const points = data?.chart_data ?? [];
    return points.map((p) => ({ name: p.label, revenue: p.revenue }));
  }, [data]);

  const isLoading = status === 'loading';
  const balance = data?.total_balance_vnd ?? 0;
  const todayRevenue = data?.today_revenue_vnd ?? 0;
  const totalAccounts = data?.total_accounts ?? 0;

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">
            {t('dashboard.welcome')}, {user?.fullName || user?.email || '...'}
          </h1>
          <div className="flex gap-3">
            <DatePicker />
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* My Balance */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray flex items-center gap-1.5">
                {t('dashboard.balance')} <span className="text-light-gray cursor-help">ⓘ</span>
              </div>
            </div>
            <div className="text-[28px] font-bold text-dark mb-2">
              {isLoading ? t('common.loading') : formatVnd(balance)}
            </div>
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                <TrendingUp size={12} /> {t('dashboard.today')}
              </span>
            </div>
            <div className="text-xs text-light-gray mb-5 flex items-center gap-2">
              {user?.email ?? '—'}
              <button className="text-primary hover:text-primary-dark flex items-center gap-1 font-medium transition-colors">
                <Copy size={12} /> {t('common.copy')}
              </button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5 rounded-xl text-xs py-2 h-auto">
                <ArrowUpRight size={14} /> {t('dashboard.transfer')}
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5 rounded-xl text-xs py-2 h-auto border-transparent bg-section-bg hover:bg-gray-200 hover:border-transparent text-gray">
                <ArrowDownLeft size={14} /> {t('dashboard.received')}
              </Button>
              <Button variant="outline" className="px-3 rounded-xl border-transparent bg-section-bg hover:bg-gray-200 hover:border-transparent text-gray h-auto py-2">
                <Plus size={16} />
              </Button>
            </div>
          </Card>

          {/* Total accounts */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray flex items-center gap-1.5">
                {t('dashboard.spent')} <span className="text-light-gray cursor-help">ⓘ</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray cursor-pointer hover:text-dark">
                <Calendar size={12} /> July 16 <ChevronDown size={12} />
              </div>
            </div>
            <div className="text-[28px] font-bold text-dark mb-2">
              {isLoading ? t('common.loading') : totalAccounts.toLocaleString('vi-VN')}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <TrendingUp size={12} /> {t('nav.bank')}
              </span>
              <span className="text-[11px] text-light-gray ml-2">{t('dashboard.compared')}</span>
            </div>
          </Card>

          {/* Today revenue */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray flex items-center gap-1.5">
                {t('dashboard.income')} <span className="text-light-gray cursor-help">ⓘ</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray cursor-pointer hover:text-dark">
                <Calendar size={12} /> July 16 <ChevronDown size={12} />
              </div>
            </div>
            <div className="text-[28px] font-bold text-dark mb-2">
              {isLoading ? t('common.loading') : formatVnd(todayRevenue)}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                <TrendingDown size={12} /> {t('dashboard.today')}
              </span>
              <span className="text-[11px] text-light-gray ml-2">{t('dashboard.compared')}</span>
            </div>
          </Card>
        </div>

        {/* Content Grid - Full Width */}
        <div className="flex flex-col gap-6">
          {/* Cashflow */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-dark">{t('dashboard.cashflow')}</h3>
              <Dropdown 
                options={[
                  { label: t('dashboard.this_week'), value: 'week' },
                  { label: t('dashboard.this_month'), value: 'month' },
                  { label: t('dashboard.this_year'), value: 'year' }
                ]}
                value={cashflowFilter}
                onChange={(v) => setCashflowFilter(v as typeof cashflowFilter)}
              />
            </div>
            
            <div className="mb-4">
              <div className="text-[24px] font-bold text-dark mb-1">
                {isLoading ? t('common.loading') : formatVnd(todayRevenue)}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <TrendingUp size={12} /> 16.8%
              </span>
            </div>
            
            <div className="flex justify-end gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray">
                <div className="w-2 h-2 rounded-full bg-dark"></div> {t('dashboard.expense')}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray">
                <div className="w-2 h-2 rounded-full bg-primary"></div> {t('dashboard.income')}
              </div>
            </div>
            
            <div className="h-[220px] relative w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#999' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#999' }} 
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => {
                      const n = typeof value === 'number' ? value : 0;
                      const label = typeof name === 'string' ? name : '';
                      return [`$${n.toLocaleString()}`, label ? label.charAt(0).toUpperCase() + label.slice(1) : label];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1a1a1a" 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, fill: '#1a1a1a', strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recently Activity */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-dark">{t('dashboard.recent_activity')}</h3>
              <Dropdown 
                options={[
                  { label: t('dashboard.today'), value: 'today' },
                  { label: t('dashboard.this_week'), value: 'week' },
                  { label: t('dashboard.this_month'), value: 'month' },
                  { label: t('dashboard.this_year'), value: 'year' }
                ]}
                value={activityFilter}
                onChange={(v) => setActivityFilter(v as typeof activityFilter)}
              />
            </div>
            
            <RecentActivityTable items={data?.recent_transactions ?? []} />
          </Card>
        </div>
      </main>
    </div>
  );
}
