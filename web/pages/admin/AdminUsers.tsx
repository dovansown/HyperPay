import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminUsers, updateUserRole } from '@/store/slices/admin/adminUsersSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';

export function AdminUsers() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((s) => s.adminUsers);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    dispatch(fetchAdminUsers({ limit: 25, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(fetchAdminUsers({ q: value, role: roleFilter || undefined, limit: 25, offset: 0 }));
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    dispatch(fetchAdminUsers({ q: searchQuery, role: value || undefined, limit: 25, offset: 0 }));
  };

  const handlePageChange = (offset: number) => {
    dispatch(fetchAdminUsers({ q: searchQuery, role: roleFilter || undefined, limit: users.limit, offset }));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(fetchAdminUsers({ q: searchQuery, role: roleFilter || undefined, limit, offset: 0 }));
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await dispatch(updateUserRole({ userId: selectedUser, role: newRole })).unwrap();
      toast.success(t('admin.users.roleUpdated'));
      setSelectedUser(null);
      setNewRole('');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật vai trò thất bại');
    }
  };

  const columns = [
    {
      key: 'email',
      label: t('admin.users.email'),
      width: '30%',
    },
    {
      key: 'full_name',
      label: t('admin.users.fullName'),
      width: '25%',
    },
    {
      key: 'role',
      label: t('admin.users.role'),
      width: '15%',
      render: (user: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
          user.role === 'EDITOR' ? 'bg-blue-100 text-blue-700' :
          user.role === 'AUTHOR' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {user.role}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: t('admin.users.createdAt'),
      width: '20%',
      render: (user: any) => new Date(user.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '10%',
      render: (user: any) => (
        <button
          onClick={() => {
            setSelectedUser(user.id);
            setNewRole(user.role);
          }}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Sửa vai trò
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">{t('admin.users.title')}</h1>
        <p className="text-gray mt-1">Quản lý người dùng và vai trò</p>
      </div>

      <FilterBar
        searchPlaceholder={t('admin.users.searchPlaceholder')}
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            label: t('admin.users.role'),
            value: roleFilter,
            onChange: handleRoleFilterChange,
            options: [
              { label: 'USER', value: 'USER' },
              { label: 'AUTHOR', value: 'AUTHOR' },
              { label: 'EDITOR', value: 'EDITOR' },
              { label: 'ADMIN', value: 'ADMIN' },
            ],
          },
        ]}
        showClearButton={!!(searchQuery || roleFilter)}
        onClearFilters={() => {
          setSearchQuery('');
          setRoleFilter('');
          dispatch(fetchAdminUsers({ limit: 25, offset: 0 }));
        }}
      />

      <AdminTable
        columns={columns}
        data={users.items}
        loading={loading}
        pagination={{
          total: users.total,
          limit: users.limit,
          offset: users.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy người dùng nào"
      />

      {/* Update Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-dark mb-4">{t('admin.users.updateRole')}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray mb-2">
                {t('admin.users.role')}
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg outline-none focus:border-primary"
              >
                <option value="USER">USER</option>
                <option value="AUTHOR">AUTHOR</option>
                <option value="EDITOR">EDITOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="flex-1 px-4 py-2 border border-[#e8e8e8] rounded-lg text-gray hover:bg-gray-50"
              >
                {t('admin.actions.cancel')}
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {t('admin.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
