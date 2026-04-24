import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    label: string;
    options: FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }>;
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

export function FilterBar({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onClearFilters,
  showClearButton = false,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.some((f) => f.value && f.value !== '');

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8e8e8] mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#e8e8e8] rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
              isExpanded || hasActiveFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray border-[#e8e8e8] hover:bg-gray-50'
            )}
          >
            <Filter size={18} />
            <span>Lọc</span>
            {hasActiveFilters && (
              <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {filters.filter((f) => f.value && f.value !== '').length}
              </span>
            )}
          </button>
        )}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <X size={18} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#e8e8e8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filters.map((filter, index) => (
            <div key={index}>
              <label className="block text-xs font-medium text-gray mb-1.5">
                {filter.label}
              </label>
              <select
                value={filter.value || ''}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">Tất cả</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
