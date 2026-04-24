import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    onPageChange: (offset: number) => void;
    onLimitChange: (limit: number) => void;
  };
  emptyMessage?: string;
  rowKey?: (item: T) => string;
}

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  pagination,
  emptyMessage = 'Không có dữ liệu',
  rowKey = (item) => item.id,
}: AdminTableProps<T>) {
  const currentPage = pagination ? Math.floor(pagination.offset / pagination.limit) + 1 : 1;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#e8e8e8]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-12 text-center">
        <p className="text-gray">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[#e8e8e8]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e8e8]">
            {data.map((item) => (
              <tr key={rowKey(item)} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-dark">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-[#e8e8e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray">Hiển thị</span>
            <select
              value={pagination.limit}
              onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
              className="px-3 py-1 border border-[#e8e8e8] rounded-lg text-sm outline-none focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray">
              trên tổng {pagination.total.toLocaleString()} mục
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.offset - pagination.limit)}
              disabled={currentPage === 1}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                currentPage === 1
                  ? 'border-[#e8e8e8] text-gray cursor-not-allowed'
                  : 'border-[#e8e8e8] text-dark hover:bg-gray-50'
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.offset + pagination.limit)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                currentPage === totalPages
                  ? 'border-[#e8e8e8] text-gray cursor-not-allowed'
                  : 'border-[#e8e8e8] text-dark hover:bg-gray-50'
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
