import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminDurations, createDuration, updateDuration, deleteDuration } from '@/store/slices/admin/adminDurationsSlice';
import { AdminTable } from '@/components/admin/AdminTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AdminDurations() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { durations, loading, error } = useAppSelector((s) => s.adminDurations);

  const [showModal, setShowModal] = useState(false);
  const [editingDuration, setEditingDuration] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminDurations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEdit = (duration: any) => {
    setEditingDuration(duration);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thời hạn này?')) return;

    try {
      await dispatch(deleteDuration(id)).unwrap();
      toast.success('Xóa thời hạn thành công');
    } catch (err: any) {
      toast.error(err.message || 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên',
      width: '25%',
    },
    {
      key: 'months',
      label: 'Tháng',
      width: '15%',
      render: (duration: any) => `${duration.months} tháng`,
    },
    {
      key: 'days',
      label: 'Ngày',
      width: '15%',
      render: (duration: any) => duration.days || '-',
    },
    {
      key: 'discount_percent',
      label: 'Giảm giá',
      width: '15%',
      render: (duration: any) =>
        duration.discount_percent ? `${duration.discount_percent}%` : '-',
    },
    {
      key: 'is_default',
      label: 'Mặc định',
      width: '15%',
      render: (duration: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            duration.is_default ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {duration.is_default ? 'Có' : 'Không'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '15%',
      render: (duration: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(duration)}
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            Sửa
          </button>
          <button
            onClick={() => {
              setDeletingId(duration.id);
              handleDelete(duration.id);
            }}
            disabled={deletingId === duration.id}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            {deletingId === duration.id ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Quản Lý Thời Hạn</h1>
          <p className="text-gray mt-1">Quản lý các gói thời hạn dịch vụ</p>
        </div>
        <button
          onClick={() => {
            setEditingDuration(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          <Plus size={18} />
          Thêm Thời Hạn
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={durations}
        loading={loading}
        emptyMessage="Không tìm thấy thời hạn nào"
      />

      <DurationFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDuration(null);
        }}
        duration={editingDuration}
        onSuccess={() => {
          setShowModal(false);
          setEditingDuration(null);
          dispatch(fetchAdminDurations());
        }}
      />
    </div>
  );
}

interface DurationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: any | null;
  onSuccess: () => void;
}

function DurationFormModal({ isOpen, onClose, duration, onSuccess }: DurationFormModalProps) {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: '',
    months: '',
    days: '',
    sort_order: '',
    is_default: false,
    discount_percent: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (duration) {
      setFormData({
        name: duration.name || '',
        months: duration.months?.toString() || '',
        days: duration.days?.toString() || '',
        sort_order: duration.sort_order?.toString() || '',
        is_default: duration.is_default || false,
        discount_percent: duration.discount_percent?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        months: '',
        days: '',
        sort_order: '',
        is_default: false,
        discount_percent: '',
      });
    }
  }, [duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        months: parseInt(formData.months),
        days: formData.days ? parseInt(formData.days) : 0,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
        is_default: formData.is_default,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
      };

      if (duration) {
        await dispatch(updateDuration({ id: duration.id, data: payload })).unwrap();
        toast.success('Cập nhật thời hạn thành công');
      } else {
        await dispatch(createDuration(payload)).unwrap();
        toast.success('Tạo thời hạn thành công');
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
      title={duration ? 'Sửa Thời Hạn' : 'Thêm Thời Hạn Mới'}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Tên *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ví dụ: 1 Năm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Số tháng *</label>
            <input
              type="number"
              value={formData.months}
              onChange={(e) => setFormData({ ...formData, months: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="12"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Số ngày</label>
            <input
              type="number"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Thứ tự</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="1"
              min="0"
            />
            <p className="text-xs text-gray mt-1">Dùng để sắp xếp thứ tự hiển thị</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Giảm giá (%)</label>
            <input
              type="number"
              value={formData.discount_percent}
              onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_default"
            checked={formData.is_default}
            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is_default" className="text-sm text-dark">
            Đặt làm thời hạn mặc định
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('admin.actions.cancel')}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : duration ? t('admin.actions.save') : t('admin.actions.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}