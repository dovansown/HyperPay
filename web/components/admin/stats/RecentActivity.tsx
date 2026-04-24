import { User, ArrowLeftRight, Webhook, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'user' | 'transaction' | 'webhook' | 'package';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
  title?: string;
}

export function RecentActivity({ activities, loading, title = 'Hoạt động gần đây' }: RecentActivityProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return <User size={16} className="text-blue-500" />;
      case 'transaction':
        return <ArrowLeftRight size={16} className="text-green-500" />;
      case 'webhook':
        return <Webhook size={16} className="text-purple-500" />;
      case 'package':
        return <Clock size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray" />;
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50';
      case 'transaction':
        return 'bg-green-50';
      case 'webhook':
        return 'bg-purple-50';
      case 'package':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e8e8e8]">
        <h2 className="text-lg font-bold text-dark mb-4">{title}</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e8e8e8]">
        <h2 className="text-lg font-bold text-dark mb-4">{title}</h2>
        <div className="text-center py-8">
          <Clock size={48} className="text-gray mx-auto mb-3" />
          <p className="text-gray">Chưa có hoạt động nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e8e8e8]">
      <h2 className="text-lg font-bold text-dark mb-4">{title}</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getTypeColor(activity.type))}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark font-medium mb-1">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray mb-1">
                  {activity.user.name} ({activity.user.email})
                </p>
              )}
              <p className="text-xs text-light-gray">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
