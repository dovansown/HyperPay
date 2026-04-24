import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e8e8e8] animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e8e8e8] hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray text-sm font-medium">{title}</div>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      
      <div className="text-3xl font-bold text-dark mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray text-sm ml-1">so với tháng trước</span>
        </div>
      )}
    </div>
  );
}
