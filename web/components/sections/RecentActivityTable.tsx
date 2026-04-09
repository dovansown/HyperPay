import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useLanguage } from '@/context/LanguageContext';
import type { RecentTransaction } from '@/store/slices/dashboardSlice';

type Row = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  direction: 'income' | 'expense';
};

function inferDirection(tx: RecentTransaction): 'income' | 'expense' {
  const t = (tx.type ?? '').toLowerCase();
  if (t.includes('credit') || t.includes('in')) return 'income';
  if (t.includes('debit') || t.includes('out')) return 'expense';
  return tx.amount >= 0 ? 'income' : 'expense';
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function RecentActivityTable({ items }: { items: RecentTransaction[] }) {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const rows: Row[] = items.map((tx) => {
    const direction = inferDirection(tx);
    const title = tx.description?.trim() ? tx.description : tx.type;
    return {
      id: tx.id,
      title: title || t('dashboard.recent_activity'),
      subtitle: tx.type,
      date: tx.occurred_at,
      amount: Math.abs(tx.amount),
      direction,
    };
  });

  const columns: Column<Row>[] = [
    {
      key: 'title',
      label: t('dashboard.recent_activity'),
      sortable: true,
      headerClassName: "w-1/2",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-base",
              item.direction === 'income' ? 'bg-[#e8f5ee] text-primary' : 'bg-gray-100 text-dark'
            )}
          >
            {(item.title?.[0] ?? '•').toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-bold text-dark">{item.title}</div>
            <div className="text-[11px] text-light-gray">{item.subtitle}</div>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: t('common.date'),
      sortable: true,
      render: (item) => <div className="text-xs text-gray">{formatDate(item.date)}</div>
    },
    {
      key: 'amount',
      label: t('common.amount'),
      sortable: true,
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => (
        <div className={cn("text-[13px] font-bold", item.direction === 'income' ? 'text-primary' : 'text-red-500')}>
          {item.direction === 'income' ? '+' : '-'}
          {formatVnd(item.amount)}
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns}
      data={rows}
      defaultPageSize={4}
      pageSizeOptions={[4, 8, 12]}
    />
  );
}
