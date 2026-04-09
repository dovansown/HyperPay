import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreditCard, Search, Filter, Settings, Zap, ShoppingCart, Wallet } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearBillingError, fetchBillingData, purchasePackage, topUpBalance } from '@/store/slices/billingSlice';

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function Billing() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { packages, durations, activePackages, balanceVnd, status, error, purchaseStatus, topUpStatus } = useAppSelector(
    (s) => s.billing
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchBillingData());
  }, [dispatch]);

  const active = activePackages[0] ?? null;

  const durationOptions = useMemo(() => {
    return [...durations].sort((a, b) => a.sort_order - b.sort_order);
  }, [durations]);

  useEffect(() => {
    if (!selectedDurationId && durationOptions.length) {
      setSelectedDurationId(Number(durationOptions[0].id));
    }
  }, [durationOptions, selectedDurationId]);

  const packageRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return packages
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        price_vnd: p.price_vnd,
      }))
      .filter((p) => (!q ? true : p.name.toLowerCase().includes(q)));
  }, [packages, searchQuery]);

  const ALL_INVOICE_COLUMNS = [
    { key: 'name', label: t('billing.plan_item') },
    { key: 'status', label: t('common.status') },
    { key: 'price_vnd', label: t('billing.amount') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_INVOICE_COLUMNS.map(c => c.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const columns: Column<(typeof packageRows)[number]>[] = [
    { key: 'name', label: t('billing.plan_item'), sortable: true, cellClassName: 'text-[13px] font-bold text-dark' },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (pkg) => (
        <span
          className={cn(
            'px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 w-fit',
            pkg.status === 'ACTIVE' ? 'bg-[#e8f5ee] text-primary' : 'bg-gray-100 text-gray'
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', pkg.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-400')} />
          {pkg.status}
        </span>
      ),
    },
    {
      key: 'price_vnd',
      label: t('billing.amount'),
      sortable: true,
      render: (pkg) => <span className="text-[13px] font-bold text-dark">{formatVnd(pkg.price_vnd)}</span>,
    },
    {
      key: 'actions',
      label: '',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (pkg) => (
        <Button
          className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPackageId(pkg.id);
          }}
        >
          <ShoppingCart size={14} /> Mua
        </Button>
      ),
    },
  ];

  const activeColumns = columns.filter(col => col.key === 'actions' || visibleColumns.includes(col.key));

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">{t('billing.title')}</h1>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Top Section: Plan, Balance, Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <span className="px-2.5 py-1 bg-[#e8f5ee] text-primary text-[11px] font-bold rounded-md">
                  {active ? t('bank.active') : '—'}
                </span>
              </div>
              <h2 className="text-[18px] font-bold text-dark mb-1">{active?.package?.name ?? 'Chưa có gói active'}</h2>
              <p className="text-[13px] text-gray mb-4">
                {active ? `Hết hạn: ${new Date(active.end_at).toLocaleDateString('vi-VN')}` : 'Mua gói để sử dụng dịch vụ.'}
              </p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[28px] font-bold text-dark">
                  {active?.package ? formatVnd(active.package.price_vnd) : '—'}
                </span>
              </div>

              <ul className="flex flex-col gap-2 mb-6">
                <li className="flex items-center gap-2 text-[13px] text-dark">
                  <span className="text-primary font-bold">Tx</span> {active?.usage.transactions ?? 0} /{' '}
                  {active?.limits.is_unlimited_transactions ? '∞' : active?.limits.transactions ?? 0}
                </li>
                <li className="flex items-center gap-2 text-[13px] text-dark">
                  <span className="text-primary font-bold">Webhook</span> {active?.usage.webhook_deliveries ?? 0} /{' '}
                  {active?.limits.is_unlimited_webhook_deliveries ? '∞' : active?.limits.webhook_deliveries ?? 0}
                </li>
                <li className="flex items-center gap-2 text-[13px] text-dark">
                  <span className="text-primary font-bold">Bank types</span> {active?.usage.bank_types ?? 0} /{' '}
                  {active?.limits.is_unlimited_bank_types ? '∞' : active?.limits.bank_types ?? 0}
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  dispatch(clearBillingError());
                  void dispatch(fetchBillingData());
                }}
                disabled={status === 'loading'}
              >
                Làm mới
              </Button>
              <Button className="flex-1 rounded-xl" onClick={() => setIsTopUpOpen(true)}>
                {t('billing.add_funds')}
              </Button>
            </div>
          </Card>

          {/* Account Balance */}
          <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-dark to-gray-800 text-white">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
              </div>
              <h2 className="text-[14px] font-medium text-gray-300 mb-1">{t('billing.available_balance')}</h2>
              <div className="text-[36px] font-bold mb-6">{status === 'loading' ? '—' : formatVnd(balanceVnd)}</div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">{t('billing.auto_recharge')}</span>
                  <span className="font-bold">{t('billing.enabled_below')}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">{t('billing.payment_method')}</span>
                  <span className="font-bold flex items-center gap-2">
                    {t('billing.payment_method')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button className="flex-1 rounded-xl bg-white text-dark hover:bg-gray-100" onClick={() => setIsTopUpOpen(true)}>
                <Wallet size={16} className="mr-2" /> {t('billing.add_funds')}
              </Button>
            </div>
          </Card>

          {/* Packages summary */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[16px] font-bold text-dark">Gói khả dụng</h2>
                <p className="text-[12px] text-gray">Chọn gói và mua theo duration</p>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-bold text-primary">{packages.length}</div>
                <div className="text-[11px] text-gray">packages</div>
              </div>
            </div>
            <div className="text-[13px] text-gray">
              {status === 'loading' ? t('common.loading') : 'Bạn có thể mua nhiều gói. Số dư sẽ bị trừ khi mua.'}
            </div>
          </Card>
        </div>

        {/* Bottom Section: Packages */}
        <h2 className="text-[18px] font-bold text-dark mb-4">{t('billing.purchase_history')}</h2>
        <Card className="p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-[#e8e8e8] flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
              <input 
                type="text" 
                placeholder={t('billing.placeholder_search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter size={14} /> {t('common.filter')}
                </Button>
                
                <Popover
                  trigger={
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                    >
                      <Settings size={14} /> {t('common.columns')}
                    </Button>
                  }
                >
                  <div className="text-[11px] font-bold text-gray uppercase px-2 mb-2">{t('common.columns')}</div>
                  {ALL_INVOICE_COLUMNS.map(col => (
                    <label key={col.key} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <Checkbox 
                        checked={visibleColumns.includes(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <span className="text-[13px] text-dark">{col.label}</span>
                    </label>
                  ))}
                </Popover>
              </div>
            </div>
          </div>

          <DataTable 
            columns={activeColumns}
            data={packageRows}
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
          {status === 'loading' && <div className="p-4 text-sm text-gray">{t('common.loading')}</div>}
        </Card>
      </main>

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t('billing.filter_title')}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('common.status')}</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors">
              <option value="">{t('bank.all_statuses')}</option>
              <option value="paid">{t('bank.active')}</option>
              <option value="pending">{t('bank.inactive')}</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.reset')}</Button>
            <Button className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.apply_filters')}</Button>
          </div>
        </div>
      </Drawer>

      {/* Top-up modal */}
      <Modal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} title={t('billing.add_funds')}>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            dispatch(clearBillingError());
            try {
              await dispatch(topUpBalance({ amountVnd: topUpAmount })).unwrap();
              setIsTopUpOpen(false);
            } catch {
              // error shown above
            }
          }}
        >
          <label className="text-[13px] font-bold text-dark">Số tiền (VND)</label>
          <input
            type="number"
            min={1}
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
          />
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsTopUpOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={topUpStatus === 'loading'}>
              {topUpStatus === 'loading' ? t('common.loading') : t('common.confirm')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Purchase modal */}
      <Modal isOpen={selectedPackageId != null} onClose={() => setSelectedPackageId(null)} title="Mua gói">
        <div className="flex flex-col gap-4">
          <div className="text-[13px] text-gray">Chọn duration để mua gói.</div>
          <label className="text-[13px] font-bold text-dark">Duration</label>
          <select
            value={selectedDurationId ?? ''}
            onChange={(e) => setSelectedDurationId(parseInt(e.target.value) || null)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
          >
            {durationOptions.map((d) => (
              <option key={d.id} value={Number(d.id)}>
                {d.name} ({d.days} ngày)
              </option>
            ))}
          </select>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedPackageId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl"
              disabled={purchaseStatus === 'loading' || selectedPackageId == null || selectedDurationId == null}
              onClick={async () => {
                if (selectedPackageId == null || selectedDurationId == null) return;
                dispatch(clearBillingError());
                try {
                  await dispatch(purchasePackage({ packageId: selectedPackageId, durationId: selectedDurationId })).unwrap();
                  await dispatch(fetchBillingData()).unwrap();
                  setSelectedPackageId(null);
                } catch {
                  // error shown above
                }
              }}
            >
              {purchaseStatus === 'loading' ? t('common.loading') : 'Mua'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
