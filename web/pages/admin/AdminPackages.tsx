import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminPackages, createPackage, updatePackage } from '@/store/slices/admin/adminPackagesSlice';
import { fetchAdminBanks } from '@/store/slices/admin/adminBanksSlice';
import { fetchAdminDurations } from '@/store/slices/admin/adminDurationsSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AdminPackages() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { packages, loading, error } = useAppSelector((s) => s.adminPackages);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminPackages({ limit: 25, offset: 0 }));
    dispatch(fetchAdminBanks({ limit: 100, offset: 0 }));
    dispatch(fetchAdminDurations());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(fetchAdminPackages({ q: value, limit: 25, offset: 0 }));
  };

  const handlePageChange = (offset: number) => {
    dispatch(fetchAdminPackages({ q: searchQuery, limit: packages.limit, offset }));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(fetchAdminPackages({ q: searchQuery, limit, offset: 0 }));
  };

  const columns = [
    { key: 'name', label: t('admin.packages.name'), width: '22%' },
    {
      key: 'status',
      label: t('admin.packages.status'),
      width: '10%',
      render: (pkg: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {pkg.status}
        </span>
      ),
    },
    {
      key: 'price_vnd',
      label: t('admin.packages.price'),
      width: '15%',
      render: (pkg: any) => `${pkg.price_vnd.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      key: 'max_transactions',
      label: t('admin.packages.maxTransactions'),
      width: '13%',
      render: (pkg: any) => pkg.max_transactions.toLocaleString('vi-VN'),
    },
    {
      key: 'max_webhook_deliveries',
      label: t('admin.packages.maxWebhooks'),
      width: '13%',
      render: (pkg: any) => pkg.max_webhook_deliveries.toLocaleString('vi-VN'),
    },
    {
      key: 'banks',
      label: t('admin.packages.banks'),
      width: '12%',
      render: (pkg: any) => pkg.banks?.length || 0,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '15%',
      render: (pkg: any) => (
        <button
          onClick={() => {
            setEditingPackage(pkg);
            setShowModal(true);
          }}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Sửa
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">{t('admin.packages.title')}</h1>
          <p className="text-gray mt-1">Quản lý gói dịch vụ và giá</p>
        </div>
        <Button
          onClick={() => {
            setEditingPackage(null);
            setShowModal(true);
          }}
          className="rounded-lg"
        >
          <Plus size={18} className="mr-2" />
          {t('admin.packages.createPackage')}
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Tìm theo tên gói..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        showClearButton={!!searchQuery}
        onClearFilters={() => {
          setSearchQuery('');
          dispatch(fetchAdminPackages({ limit: 25, offset: 0 }));
        }}
      />

      <AdminTable
        columns={columns}
        data={packages.items}
        loading={loading}
        pagination={{
          total: packages.total,
          limit: packages.limit,
          offset: packages.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy gói dịch vụ nào"
      />

      <PackageFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPackage(null);
        }}
        package={editingPackage}
        onSuccess={() => {
          setShowModal(false);
          setEditingPackage(null);
          dispatch(fetchAdminPackages({ q: searchQuery, limit: packages.limit, offset: packages.offset }));
        }}
      />
    </div>
  );
}

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: any | null;
  onSuccess: () => void;
}

function PackageFormModal({ isOpen, onClose, package: pkg, onSuccess }: PackageFormModalProps) {
  const dispatch = useAppDispatch();
  const { banks } = useAppSelector((s) => s.adminBanks);
  const { durations } = useAppSelector((s) => s.adminDurations);

  const emptyForm = {
    name: '',
    description: '',
    status: 'ACTIVE',
    price_vnd: '',
    max_transactions: '',
    max_webhook_deliveries: '',
    apply_default_discount: true,
    bank_ids: [] as string[],
    pricing: [] as Array<{ duration_id: string; price_vnd: string }>,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (pkg) {
      setFormData({
        name: pkg.name || '',
        description: pkg.description || '',
        status: pkg.status || 'ACTIVE',
        price_vnd: pkg.price_vnd?.toString() || '',
        max_transactions: pkg.max_transactions?.toString() || '',
        max_webhook_deliveries: pkg.max_webhook_deliveries?.toString() || '',
        apply_default_discount: pkg.apply_default_discount ?? true,
        bank_ids: pkg.banks?.map((b: any) => b.bank_id) || [],
        pricing: pkg.pricing?.map((p: any) => ({
          duration_id: p.duration_id,
          price_vnd: p.price_vnd?.toString() || '',
        })) || [],
      });
      return;
    }

    setFormData(emptyForm);
  }, [pkg, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status as 'ACTIVE' | 'INACTIVE',
        price_vnd: Number(formData.price_vnd),
        max_transactions: Number(formData.max_transactions),
        max_webhook_deliveries: Number(formData.max_webhook_deliveries),
        apply_default_discount: formData.apply_default_discount,
        banks: formData.bank_ids.map((bank_id) => ({ bank_id, account_limit: 1 })),
        pricing: formData.pricing
          .filter((p) => p.duration_id && p.price_vnd)
          .map((p) => ({ duration_id: p.duration_id, price_vnd: Number(p.price_vnd) })),
      };

      if (pkg) {
        await dispatch(updatePackage({ id: pkg.id, data: payload })).unwrap();
        toast.success('Cập nhật gói thành công');
      } else {
        await dispatch(createPackage(payload)).unwrap();
        toast.success('Tạo gói thành công');
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankToggle = (bankId: string) => {
    setFormData((prev) => ({
      ...prev,
      bank_ids: prev.bank_ids.includes(bankId)
        ? prev.bank_ids.filter((id) => id !== bankId)
        : [...prev.bank_ids, bankId],
    }));
  };

  const handleAddPricing = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { duration_id: '', price_vnd: '' }],
    }));
  };

  const handleRemovePricing = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index),
    }));
  };

  const handlePricingChange = (index: number, field: 'duration_id' | 'price_vnd', value: string) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pkg ? 'Sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'} className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        <div className="space-y-4">
          <h3 className="font-semibold text-dark">Thông tin cơ bản</h3>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Tên gói *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Trạng thái *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Giá cơ bản (VNĐ) *</label>
              <input
                type="number"
                value={formData.price_vnd}
                onChange={(e) => setFormData({ ...formData, price_vnd: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-dark">Giới hạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Giao dịch tối đa *</label>
              <input
                type="number"
                value={formData.max_transactions}
                onChange={(e) => setFormData({ ...formData, max_transactions: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Webhook tối đa *</label>
              <input
                type="number"
                value={formData.max_webhook_deliveries}
                onChange={(e) => setFormData({ ...formData, max_webhook_deliveries: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-dark">Ngân hàng hỗ trợ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
            {banks.items.map((bank: any) => (
              <label key={bank.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.bank_ids.includes(bank.id)}
                  onChange={() => handleBankToggle(bank.id)}
                  className="rounded"
                />
                <span>{bank.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-dark">Giá theo thời hạn</h3>
            <button type="button" onClick={handleAddPricing} className="text-sm text-primary hover:text-primary-dark font-medium">
              + Thêm giá
            </button>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-dark">
            <input
              type="checkbox"
              checked={formData.apply_default_discount}
              onChange={(e) => setFormData({ ...formData, apply_default_discount: e.target.checked })}
              className="rounded"
            />
            Áp dụng giảm giá mặc định
          </label>

          {formData.pricing.map((pricing, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 items-start">
              <select
                value={pricing.duration_id}
                onChange={(e) => handlePricingChange(index, 'duration_id', e.target.value)}
                className="flex-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Chọn thời hạn</option>
                {durations.map((duration: any) => (
                  <option key={duration.id} value={duration.id}>
                    {duration.name} - {duration.months} tháng
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Giá (VNĐ)"
                value={pricing.price_vnd}
                onChange={(e) => handlePricingChange(index, 'price_vnd', e.target.value)}
                className="flex-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
              <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => handleRemovePricing(index)}>
                Xóa
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" className="rounded-lg" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" className="rounded-lg" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : pkg ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
