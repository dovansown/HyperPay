import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminWebhooks } from '@/store/slices/admin/adminWebhooksSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';

export function AdminWebhooks() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { webhooks, loading, error } = useAppSelector((s) => s.adminWebhooks);

  const [searchQuery, setSearchQuery] = useState('');
  const [authTypeFilter, setAuthTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAdminWebhooks({ limit: 25, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(
      fetchAdminWebhooks({
        q: value,
        auth_type: authTypeFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true',
        limit: 25,
        offset: 0,
      })
    );
  };

  const handleAuthTypeFilterChange = (value: string) => {
    setAuthTypeFilter(value);
    dispatch(
      fetchAdminWebhooks({
        q: searchQuery,
        auth_type: value || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true',
        limit: 25,
        offset: 0,
      })
    );
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    dispatch(
      fetchAdminWebhooks({
        q: searchQuery,
        auth_type: authTypeFilter || undefined,
        is_active: value === '' ? undefined : value === 'true',
        limit: 25,
        offset: 0,
      })
    );
  };

  const handlePageChange = (offset: number) => {
    dispatch(
      fetchAdminWebhooks({
        q: searchQuery,
        auth_type: authTypeFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true',
        limit: webhooks.limit,
        offset,
      })
    );
  };

  const handleLimitChange = (limit: number) => {
    dispatch(
      fetchAdminWebhooks({
        q: searchQuery,
        auth_type: authTypeFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true',
        limit,
        offset: 0,
      })
    );
  };

  const getAuthTypeLabel = (type: string) => {
    switch (type) {
      case 'NONE':
        return 'Không';
      case 'BASIC':
        return 'Basic Auth';
      case 'BEARER':
        return 'Bearer Token';
      default:
        return type;
    }
  };

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'IN':
        return 'Tiền vào';
      case 'OUT':
        return 'Tiền ra';
      case 'BOTH':
        return 'Cả hai';
      default:
        return direction;
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'Người dùng',
      width: '20%',
      render: (wh: any) => (
        <div className="text-sm">
          <div className="font-medium">{wh.user?.email || '-'}</div>
          <div className="text-gray text-xs">{wh.user?.full_name || '-'}</div>
        </div>
      ),
    },
    {
      key: 'url',
      label: 'URL',
      width: '25%',
      render: (wh: any) => (
        <div className="flex items-center gap-1">
          <a
            href={wh.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark text-sm truncate max-w-[200px] block"
          >
            {wh.url}
          </a>
          <ExternalLink size={12} className="text-gray flex-shrink-0" />
        </div>
      ),
    },
    {
      key: 'auth_type',
      label: 'Auth',
      width: '10%',
      render: (wh: any) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {getAuthTypeLabel(wh.auth_type)}
        </span>
      ),
    },
    {
      key: 'content_type',
      label: 'Content-Type',
      width: '10%',
      render: (wh: any) => (
        <span className="text-xs font-medium">{wh.content_type || '-'}</span>
      ),
    },
    {
      key: 'transaction_direction',
      label: 'Hướng',
      width: '10%',
      render: (wh: any) => (
        <span className="text-xs">{getDirectionLabel(wh.transaction_direction)}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      width: '10%',
      render: (wh: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            wh.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {wh.is_active ? 'Hoạt động' : 'Tắt'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      width: '15%',
      render: (wh: any) => new Date(wh.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'account_ids',
      label: 'Tài khoản',
      width: '10%',
      render: (wh: any) => (wh.account_ids?.length || 0) + ' tài khoản',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Quản Lý Webhooks</h1>
        <p className="text-gray mt-1">Giám sát và quản lý webhook endpoints</p>
      </div>

      <FilterBar
        searchPlaceholder="Tìm theo URL hoặc email..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            label: 'Auth Type',
            value: authTypeFilter,
            onChange: handleAuthTypeFilterChange,
            options: [
              { label: 'Tất cả', value: '' },
              { label: 'NONE', value: 'NONE' },
              { label: 'BASIC', value: 'BASIC' },
              { label: 'BEARER', value: 'BEARER' },
            ],
          },
          {
            label: 'Trạng thái',
            value: activeFilter,
            onChange: handleActiveFilterChange,
            options: [
              { label: 'Tất cả', value: '' },
              { label: 'Hoạt động', value: 'true' },
              { label: 'Tắt', value: 'false' },
            ],
          },
        ]}
        showClearButton={!!(searchQuery || authTypeFilter || activeFilter)}
        onClearFilters={() => {
          setSearchQuery('');
          setAuthTypeFilter('');
          setActiveFilter('');
          dispatch(fetchAdminWebhooks({ limit: 25, offset: 0 }));
        }}
      />

      <AdminTable
        columns={columns}
        data={webhooks.items}
        loading={loading}
        pagination={{
          total: webhooks.total,
          limit: webhooks.limit,
          offset: webhooks.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy webhook nào"
      />
    </div>
  );
}