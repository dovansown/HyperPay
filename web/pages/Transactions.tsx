import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { ArrowDownLeft, ArrowUpRight, Download, Filter, Search, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearTransactions, fetchTransactionsByAccount } from '@/store/slices/transactionsSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function Transactions() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const transactions = useAppSelector((s) => s.transactions.items);
  const transactionsStatus = useAppSelector((s) => s.transactions.status);
  const transactionsError = useAppSelector((s) => s.transactions.error);

  const accounts = useAppSelector((s) => s.accounts.items);
  const accountsStatus = useAppSelector((s) => s.accounts.status);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'IN' | 'OUT'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    void dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select first account if available
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (selectedAccountId) {
      void dispatch(fetchTransactionsByAccount(selectedAccountId));
    } else {
      dispatch(clearTransactions());
    }
  }, [dispatch, selectedAccountId]);

  const ALL_COLUMNS = [
    { key: 'type', label: t('transactions.type') || 'Type' },
    { key: 'amount', label: t('transactions.amount') || 'Amount' },
    { key: 'description', label: t('transactions.description') || 'Description' },
    { key: 'date', label: t('transactions.date') || 'Date' },
  ];
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const columns: Column<(typeof tableRows)[number]>[] = [
    {
      key: 'type',
      label: t('transactions.type') || 'Type',
      sortable: true,
      render: (tx) => (
        <div className="flex items-center gap-2">
          {tx.type === 'IN' ? (
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          )}
          <span className={`text-[13px] font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
            {tx.type === 'IN' ? (t('transactions.income') || 'Income') : (t('transactions.expense') || 'Expense')}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      label: t('transactions.amount') || 'Amount',
      sortable: true,
      render: (tx) => (
        <span className={`text-[13px] font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
          {tx.type === 'IN' ? '+' : '-'}{formatVnd(tx.amountNum)}
        </span>
      )
    },
    {
      key: 'description',
      label: t('transactions.description') || 'Description',
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'date',
      label: t('transactions.date') || 'Date',
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
  ];

  const tableRows = useMemo(() => {
    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: formatVnd(Number(tx.amount)),
      amountNum: Number(tx.amount),
      description: tx.description || '—',
      date: formatDate(tx.occurred_at),
    }));
  }, [transactions]);

  const activeColumns = columns.filter((col) => visibleColumns.includes(col.key));

  const filteredRows = useMemo(() => {
    let filtered = tableRows;

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (r) => r.description.toLowerCase().includes(q) || r.amount.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedType);
    }

    // Amount range filter
    if (minAmount) {
      const min = Number(minAmount);
      filtered = filtered.filter((r) => r.amountNum >= min);
    }
    if (maxAmount) {
      const max = Number(maxAmount);
      filtered = filtered.filter((r) => r.amountNum <= max);
    }

    return filtered;
  }, [searchQuery, tableRows, selectedType, minAmount, maxAmount]);

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;

    const headers = ['Type', 'Amount', 'Description', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map((row) =>
        [row.type, row.amountNum, `"${row.description}"`, row.date].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalIncome = useMemo(() => {
    return filteredRows
      .filter((r) => r.type === 'IN')
      .reduce((sum, r) => sum + r.amountNum, 0);
  }, [filteredRows]);

  const totalExpense = useMemo(() => {
    return filteredRows
      .filter((r) => r.type === 'OUT')
      .reduce((sum, r) => sum + r.amountNum, 0);
  }, [filteredRows]);

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">{t('transactions.title') || 'Transactions'}</h1>
        </div>

        {transactionsError && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {transactionsError}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Card className="p-5">
            <div className="text-xs text-gray mb-2">{t('transactions.total_income') || 'Total Income'}</div>
            <div className="text-[24px] font-bold text-green-600">{formatVnd(totalIncome)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray mb-2">{t('transactions.total_expense') || 'Total Expense'}</div>
            <div className="text-[24px] font-bold text-red-600">{formatVnd(totalExpense)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray mb-2">{t('transactions.net_balance') || 'Net Balance'}</div>
            <div className={`text-[24px] font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatVnd(totalIncome - totalExpense)}
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-[#e8e8e8] flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
              <input 
                type="text" 
                placeholder={t('transactions.search_placeholder') || 'Search transactions...'} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                {/* Account Selector */}
                <select
                  className="px-3 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={accountsStatus === 'loading'}
                >
                  <option value="">{t('transactions.select_account') || 'Select account...'}</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} - {acc.account_number.slice(-4)}
                    </option>
                  ))}
                </select>

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
                  {ALL_COLUMNS.map(col => (
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

              <Button 
                className="gap-2 rounded-xl text-[13px] py-2 px-4 h-auto"
                onClick={handleExportCSV}
                disabled={filteredRows.length === 0}
              >
                <Download size={14} /> {t('transactions.export') || 'Export'}
              </Button>
            </div>
          </div>

          {/* Table */}
          {transactionsStatus === 'loading' ? (
            <div className="p-8 text-center text-gray">{t('common.loading')}</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-8 text-center text-gray">
              {selectedAccountId 
                ? (t('transactions.no_transactions') || 'No transactions found')
                : (t('transactions.select_account_first') || 'Please select an account to view transactions')
              }
            </div>
          ) : (
            <DataTable 
              columns={activeColumns} 
              data={filteredRows}
              defaultPageSize={10}
              pageSizeOptions={[10, 20, 50]}
            />
          )}
        </Card>
      </main>

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t('transactions.filter_title') || 'Filter Transactions'}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('transactions.type') || 'Type'}</label>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
            >
              <option value="all">{t('transactions.all_types') || 'All types'}</option>
              <option value="IN">{t('transactions.income') || 'Income'}</option>
              <option value="OUT">{t('transactions.expense') || 'Expense'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('transactions.amount_range') || 'Amount Range'}</label>
            <div className="flex gap-3">
              <input 
                type="number" 
                placeholder={t('transactions.min') || 'Min'}
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
              <input 
                type="number" 
                placeholder={t('transactions.max') || 'Max'}
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl" 
              onClick={() => {
                setSelectedType('all');
                setMinAmount('');
                setMaxAmount('');
              }}
            >
              {t('transactions.reset') || 'Reset'}
            </Button>
            <Button 
              className="flex-1 rounded-xl" 
              onClick={() => setIsFilterOpen(false)}
            >
              {t('transactions.apply') || 'Apply'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
