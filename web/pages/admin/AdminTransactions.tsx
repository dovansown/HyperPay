import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminTransactions } from '@/store/slices/admin/adminTransactionsSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';

export function AdminTransactions() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { transactions, loading, error } = useAppSelector((s) => s.adminTransactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    dispatch(fetchAdminTransactions({ limit: 25, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const fetchWithFilters = (overrideParams?: any) => {
    dispatch(
      fetchAdminTransactions({
        q: searchQuery,
        tx_type: (typeFilter || undefined) as 'IN' | 'OUT' | undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        limit: 25,
        offset: 0,
        ...overrideParams,
      })
    );
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchWithFilters({ q: value, offset: 0 });
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    fetchWithFilters({ tx_type: value || undefined, offset: 0 });
  };

  const handlePageChange = (offset: number) => {
    dispatch(
      fetchAdminTransactions({
        q: searchQuery,
        tx_type: (typeFilter || undefined) as 'IN' | 'OUT' | undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        limit: transactions.limit,
        offset,
      })
    );
  };

  const handleLimitChange = (limit: number) => {
    dispatch(
      fetchAdminTransactions({
        q: searchQuery,
        tx_type: (typeFilter || undefined) as 'IN' | 'OUT' | undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        limit,
        offset: 0,
      })
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Math.abs(amount).toLocaleString('vi-VN');
    return type === 'IN' ? `+${formatted}` : `-${formatted}`;
  };

  const columns = [
    {
      key: 'external_id',
      label: 'Mã GD',
      width: '15%',
      render: (tx: any) => (
        <span className="text-xs font-mono">{tx.external_id || tx.id.slice(0, 8)}</span>
      ),
    },
    {
      key: 'type',
      label: 'Loại',
      width: '8%',
      render: (tx: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            tx.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {tx.type === 'IN' ? 'Vào' : 'Ra'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Số tiền',
      width: '12%',
      render: (tx: any) => (
        <span className={`font-medium ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
          {formatAmount(tx.amount, tx.type)} đ
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Số dư',
      width: '12%',
      render: (tx: any) =>
        tx.balance !== null ? `${tx.balance.toLocaleString('vi-VN')} đ` : '-',
    },
    {
      key: 'bank_account',
      label: 'Tài khoản',
      width: '18%',
      render: (tx: any) => (
        <div className="text-xs">
          <div className="font-medium">{tx.bank_account?.bank_name || '-'}</div>
          <div className="text-gray">{tx.bank_account?.account_number || '-'}</div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Người dùng',
      width: '15%',
      render: (tx: any) => (
        <div className="text-xs">
          <div className="font-medium">{tx.user?.email || '-'}</div>
          <div className="text-gray">{tx.user?.full_name || '-'}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      width: '12%',
      render: (tx: any) => (
        <span className="text-xs text-gray truncate block max-w-[120px]" title={tx.description}>
          {tx.description || '-'}
        </span>
      ),
    },
    {
      key: 'occurred_at',
      label: 'Thời gian',
      width: '8%',
      render: (tx: any) => (
        <span className="text-xs">
          {new Date(tx.occurred_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Quản Lý Giao Dịch</h1>
        <p className="text-gray mt-1">Giám sát tất cả giao dịch</p>
      </div>

      <FilterBar
        searchPlaceholder="Tìm theo mã giao dịch, email, mô tả..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            label: 'Loại giao dịch',
            value: typeFilter,
            onChange: handleTypeFilterChange,
            options: [
              { label: 'IN - Tiền vào', value: 'IN' },
              { label: 'OUT - Tiền ra', value: 'OUT' },
            ],
          },
        ]}
        showClearButton={!!(searchQuery || typeFilter || dateFrom || dateTo)}
        onClearFilters={() => {
          setSearchQuery('');
          setTypeFilter('');
          setDateFrom('');
          setDateTo('');
          dispatch(fetchAdminTransactions({ limit: 25, offset: 0 }));
        }}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-dark">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              const value = e.target.value;
              setDateFrom(value);
              fetchWithFilters({ from: value || undefined, offset: 0 });
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-dark">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              const value = e.target.value;
              setDateTo(value);
              fetchWithFilters({ to: value || undefined, offset: 0 });
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>



      <AdminTable
        columns={columns}
        data={transactions.items}
        loading={loading}
        pagination={{
          total: transactions.total,
          limit: transactions.limit,
          offset: transactions.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy giao dịch nào"
      />
    </div>
  );
}