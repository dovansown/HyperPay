import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminUserPackages, assignUserPackage, updateUserPackageStatus } from '@/store/slices/admin/adminUserPackagesSlice';
import { fetchAdminUsers } from '@/store/slices/admin/adminUsersSlice';
import { fetchAdminPackages } from '@/store/slices/admin/adminPackagesSlice';
import { fetchAdminDurations } from '@/store/slices/admin/adminDurationsSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const STATUS_OPTIONS = ['active', 'expired', 'cancelled'];

export function AdminUserPackages() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { userPackages, loading, error } = useAppSelector((s) => s.adminUserPackages);
  const { users } = useAppSelector((s) => s.adminUsers);
  const { packages } = useAppSelector((s) => s.adminPackages);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminUserPackages({ limit: 25, offset: 0 }));
    dispatch(fetchAdminUsers({ limit: 100, offset: 0 }));
    dispatch(fetchAdminPackages({ limit: 100, offset: 0 }));
    dispatch(fetchAdminDurations());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const fetchUserPackages = (override: Record<string, any> = {}) => {
    dispatch(
      fetchAdminUserPackages({
        q: searchQuery || undefined,
        status: statusFilter || undefined,
        user_id: userFilter || undefined,
        package_id: packageFilter || undefined,
        limit: userPackages.limit,
        offset: userPackages.offset,
        ...override,
      })
    );
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(
      fetchAdminUserPackages({
        q: value || undefined,
        status: statusFilter || undefined,
        user_id: userFilter || undefined,
        package_id: packageFilter || undefined,
        limit: 25,
        offset: 0,
      })
    );
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    dispatch(
      fetchAdminUserPackages({
        q: searchQuery || undefined,
        status: value || undefined,
        user_id: userFilter || undefined,
        package_id: packageFilter || undefined,
        limit: 25,
        offset: 0,
      })
    );
  };

  const handleUserFilterChange = (value: string) => {
    setUserFilter(value);
    dispatch(
      fetchAdminUserPackages({
        q: searchQuery || undefined,
        status: statusFilter || undefined,
        user_id: value || undefined,
        package_id: packageFilter || undefined,
        limit: 25,
        offset: 0,
      })
    );
  };

  const handlePackageFilterChange = (value: string) => {
    setPackageFilter(value);
    dispatch(
      fetchAdminUserPackages({
        q: searchQuery || undefined,
        status: statusFilter || undefined,
        user_id: userFilter || undefined,
        package_id: value || undefined,
        limit: 25,
        offset: 0,
      })
    );
  };

  const handlePageChange = (offset: number) => {
    fetchUserPackages({ offset });
  };

  const handleLimitChange = (limit: number) => {
    fetchUserPackages({ limit, offset: 0 });
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedPackage) return;

    try {
      await dispatch(updateUserPackageStatus({ id: selectedPackage.id, status })).unwrap();
      toast.success('Cập nhật trạng thái thành công');
      setShowStatusModal(false);
      setSelectedPackage(null);
      fetchUserPackages();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại');
    }
  };

  const columns = [
    {
      key: 'user',
      label: t('admin.users.email') || 'Email',
      width: '20%',
      render: (up: any) => up.user?.email || '-',
    },
    {
      key: 'user_name',
      label: t('admin.users.fullName') || 'Họ Tên',
      width: '15%',
      render: (up: any) => up.user?.full_name || '-',
    },
    {
      key: 'package',
      label: t('admin.packages.name') || 'Gói',
      width: '15%',
      render: (up: any) => up.package?.name || '-',
    },
    {
      key: 'status',
      label: t('admin.packages.status') || 'Trạng Thái',
      width: '10%',
      render: (up: any) => {
        const normalized = String(up.status || '').toLowerCase();
        const tone = normalized === 'active'
          ? 'bg-green-100 text-green-700'
          : normalized === 'expired'
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 text-gray-700';

        return <span className={`px-2 py-1 rounded text-xs font-medium ${tone}`}>{normalized || '-'}</span>;
      },
    },
    {
      key: 'end_at',
      label: 'Ngày hết hạn',
      width: '15%',
      render: (up: any) => (up.end_at ? new Date(up.end_at).toLocaleDateString('vi-VN') : '-'),
    },
    {
      key: 'usage',
      label: 'Đã sử dụng',
      width: '15%',
      render: (up: any) => (
        <div className="text-xs">
          <div>TX: {up.used_transactions}</div>
          <div>WH: {up.used_webhook_deliveries}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '10%',
      render: (up: any) => (
        <button
          onClick={() => {
            setSelectedPackage(up);
            setShowStatusModal(true);
          }}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Đổi trạng thái
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Quản Lý Gói Người Dùng</h1>
          <p className="text-gray mt-1">Phân công và quản lý gói dịch vụ cho người dùng</p>
        </div>
        <Button onClick={() => setShowAssignModal(true)} className="rounded-lg">
          <Plus size={18} className="mr-2" />
          Phân Gói
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Tìm theo email hoặc tên người dùng..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            label: 'Trạng thái',
            value: statusFilter,
            onChange: handleStatusFilterChange,
            options: STATUS_OPTIONS.map((status) => ({ label: status, value: status })),
          },
          {
            label: 'Người dùng',
            value: userFilter,
            onChange: handleUserFilterChange,
            options: users.items.map((user: any) => ({ label: user.email, value: user.id })),
          },
          {
            label: 'Gói',
            value: packageFilter,
            onChange: handlePackageFilterChange,
            options: packages.items.map((pkg: any) => ({ label: pkg.name, value: pkg.id })),
          },
        ]}
        showClearButton={!!(searchQuery || statusFilter || userFilter || packageFilter)}
        onClearFilters={() => {
          setSearchQuery('');
          setStatusFilter('');
          setUserFilter('');
          setPackageFilter('');
          dispatch(fetchAdminUserPackages({ limit: 25, offset: 0 }));
        }}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:hidden">
        <select
          value={userFilter}
          onChange={(e) => handleUserFilterChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả người dùng</option>
          {users.items.map((user: any) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <select
          value={packageFilter}
          onChange={(e) => handlePackageFilterChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả gói</option>
          {packages.items.map((pkg: any) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={userPackages.items}
        loading={loading}
        pagination={{
          total: userPackages.total,
          limit: userPackages.limit,
          offset: userPackages.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy gói người dùng nào"
      />

      <AssignPackageModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          fetchUserPackages({ offset: 0 });
        }}
      />

      {selectedPackage && (
        <UpdateStatusModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedPackage(null);
          }}
          currentStatus={String(selectedPackage.status || '').toLowerCase() || 'active'}
          onConfirm={handleUpdateStatus}
        />
      )}
    </div>
  );
}

interface AssignPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AssignPackageModal({ isOpen, onClose, onSuccess }: AssignPackageModalProps) {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((s) => s.adminUsers);
  const { packages } = useAppSelector((s) => s.adminPackages);
  const { durations } = useAppSelector((s) => s.adminDurations);

  const emptyForm = {
    user_id: '',
    package_id: '',
    duration_id: '',
    start_at: '',
    end_at: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) setFormData(emptyForm);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        user_id: formData.user_id,
        package_id: formData.package_id,
        status: formData.status,
      };

      if (formData.duration_id) payload.duration_id = formData.duration_id;
      if (formData.start_at) payload.start_at = new Date(formData.start_at).toISOString();
      if (formData.end_at) payload.end_at = new Date(formData.end_at).toISOString();

      await dispatch(assignUserPackage(payload)).unwrap();
      toast.success('Phân gói thành công');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phân gói dịch vụ">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Người dùng *</label>
          <select
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Chọn người dùng</option>
            {users.items.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.email} - {user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">Gói dịch vụ *</label>
          <select
            value={formData.package_id}
            onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Chọn gói</option>
            {packages.items.map((pkg: any) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} - {pkg.price_vnd.toLocaleString('vi-VN')} VNĐ
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">Thời hạn</label>
          <select
            value={formData.duration_id}
            onChange={(e) => setFormData({ ...formData, duration_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Tự động tính</option>
            {durations.map((duration: any) => (
              <option key={duration.id} value={duration.id}>
                {duration.name} - {duration.months} tháng
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              value={formData.start_at}
              onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Ngày kết thúc</label>
            <input
              type="date"
              value={formData.end_at}
              onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">Trạng thái</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" className="rounded-lg" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" className="rounded-lg" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Phân gói'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onConfirm: (status: string) => void;
}

function UpdateStatusModal({ isOpen, onClose, currentStatus, onConfirm }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật trạng thái">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray mb-2">Trạng thái mới</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg outline-none focus:border-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-lg">
            Hủy
          </Button>
          <Button onClick={() => onConfirm(selectedStatus)} className="flex-1 rounded-lg">
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
}
