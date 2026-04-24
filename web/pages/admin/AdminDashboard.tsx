import { useEffect } from 'react';
import { Users, Package, ArrowLeftRight, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminDashboard } from '@/store/slices/admin/adminSettingsSlice';
import { StatCard } from '@/components/admin/stats/StatCard';
import { RecentActivity } from '@/components/admin/stats/RecentActivity';

export function AdminDashboard() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.adminSettings.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const stats = data?.stats ?? {
    totalUsers: 0,
    activePackages: 0,
    totalTransactions: 0,
    activeWebhooks: 0,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">{t('admin.dashboard')}</h1>
        <p className="text-gray mt-1">Chào mừng đến với bảng quản trị</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('admin.stats.totalUsers')}
          value={stats.totalUsers}
          icon={<Users size={20} />}
          loading={loading}
        />
        <StatCard
          title={t('admin.stats.activePackages')}
          value={stats.activePackages}
          icon={<Package size={20} />}
          loading={loading}
        />
        <StatCard
          title={t('admin.stats.totalTransactions')}
          value={stats.totalTransactions}
          icon={<ArrowLeftRight size={20} />}
          loading={loading}
        />
        <StatCard
          title={t('admin.stats.activeWebhooks')}
          value={stats.activeWebhooks}
          icon={<Webhook size={20} />}
          loading={loading}
        />
      </div>

      <RecentActivity
        activities={data?.activities ?? []}
        loading={loading}
        title={t('admin.stats.recentTransactions')}
      />
    </div>
  );
}
