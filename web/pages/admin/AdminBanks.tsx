import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminBanks, createBank, updateBank } from '@/store/slices/admin/adminBanksSlice';
import { FilterBar } from '@/components/admin/FilterBar';
import { AdminTable } from '@/components/admin/AdminTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AdminBanks() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { banks, loading, error } = useAppSelector((s) => s.adminBanks);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminBanks({ limit: 25, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(fetchAdminBanks({ q: value, limit: 25, offset: 0 }));
  };

  const handlePageChange = (offset: number) => {
    dispatch(fetchAdminBanks({ q: searchQuery, limit: banks.limit, offset }));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(fetchAdminBanks({ q: searchQuery, limit, offset: 0 }));
  };

  const columns = [
    {
      key: 'name',
      label: t('admin.banks.name'),
      width: '35%',
    },
    {
      key: 'code',
      label: t('admin.banks.code'),
      width: '20%',
    },
    {
      key: 'icon_url',
      label: t('admin.banks.iconUrl'),
      width: '30%',
      render: (bank: any) =>
        bank.icon_url ? (
          <img src={bank.icon_url} alt={bank.name} className="h-8 w-auto object-contain" />
        ) : (
          <span className="text-gray text-sm">-</span>
        ),
    },
    {
      key: 'created_at',
      label: t('admin.users.createdAt'),
      width: '15%',
      render: (bank: any) => new Date(bank.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '10%',
      render: (bank: any) => (
        <button
          onClick={() => {
            setEditingBank(bank);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">{t('admin.banks.title')}</h1>
          <p className="text-gray mt-1">Quản lý ngân hàng hỗ trợ</p>
        </div>
        <button
          onClick={() => {
            setEditingBank(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <Plus size={18} />
          {t('admin.banks.createBank')}
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Tìm theo tên hoặc mã ngân hàng..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        showClearButton={!!searchQuery}
        onClearFilters={() => {
          setSearchQuery('');
          dispatch(fetchAdminBanks({ limit: 25, offset: 0 }));
        }}
      />

      <AdminTable
        columns={columns}
        data={banks.items}
        loading={loading}
        pagination={{
          total: banks.total,
          limit: banks.limit,
          offset: banks.offset,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        emptyMessage="Không tìm thấy ngân hàng nào"
      />

      <BankFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBank(null);
        }}
        bank={editingBank}
        onSuccess={() => {
          setShowModal(false);
          setEditingBank(null);
          dispatch(fetchAdminBanks({ q: searchQuery, limit: banks.limit, offset: banks.offset }));
        }}
      />
    </div>
  );
}

interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: any | null;
  onSuccess: () => void;
}

function BankFormModal({ isOpen, onClose, bank, onSuccess }: BankFormModalProps) {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    icon_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name || '',
        code: bank.code || '',
        icon_url: bank.icon_url || '',
      });
    } else {
      setFormData({ name: '', code: '', icon_url: '' });
    }
  }, [bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        icon_url: formData.icon_url || undefined,
      };

      if (bank) {
        await dispatch(updateBank({ id: bank.id, data: payload })).unwrap();
        toast.success(t('admin.banks.bankUpdated'));
      } else {
        await dispatch(createBank(payload)).unwrap();
        toast.success(t('admin.banks.bankCreated'));
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bank ? t('admin.banks.editBank') : t('admin.banks.createBank')}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t('admin.banks.name')} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ví dụ: Vietcombank"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t('admin.banks.code')} *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ví dụ: VCB"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t('admin.banks.iconUrl')}
          </label>
          <input
            type="url"
            value={formData.icon_url}
            onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/icon.png"
          />
          <p className="text-xs text-gray mt-1">Đường dẫn URL tới icon ngân hàng (tùy chọn)</p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('admin.actions.cancel')}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : bank ? t('admin.actions.save') : t('admin.actions.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}