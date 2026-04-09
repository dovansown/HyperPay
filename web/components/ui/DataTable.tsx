import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSizeOptions = [4, 8, 12, 20],
  defaultPageSize = 8,
  onRowClick,
  className
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 if data changes and we're out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown size={10} className="text-gray-300 ml-1 inline" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={10} className="ml-1 inline text-dark" /> : <ChevronDown size={10} className="ml-1 inline text-dark" />;
  };

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-gray-50/50">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn(
                    "px-6 py-4 text-[12px] font-bold text-gray uppercase tracking-wider",
                    col.sortable && "cursor-pointer hover:text-dark transition-colors select-none",
                    col.headerClassName
                  )}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className={cn("flex items-center", col.headerClassName?.includes('text-right') && "justify-end")}>
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-[13px] text-gray">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={cn(
                    "border-b border-[#e8e8e8] last:border-0 transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-gray-50/50" : "hover:bg-gray-50/50"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-6 py-4", col.cellClassName)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#e8e8e8] bg-white">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray">Show:</span>
          <select 
            className="text-[12px] border border-[#e8e8e8] rounded-md px-2 py-1 outline-none text-dark bg-white focus:border-primary cursor-pointer"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[12px] text-gray">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button 
              className="w-7 h-7 flex items-center justify-center rounded-md border border-[#e8e8e8] text-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              className="w-7 h-7 flex items-center justify-center rounded-md border border-[#e8e8e8] text-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
