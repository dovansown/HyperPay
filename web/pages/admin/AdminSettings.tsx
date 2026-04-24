import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSystemSettings, updateSystemSettings } from '@/store/slices/admin/adminSettingsSlice';

export function AdminSettings() {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((s) => s.adminSettings);

  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_secure: false,
    smtp_user: '',
    smtp_pass: '',
    smtp_from_email: '',
    smtp_from_name: '',
    rate_login_attempts: '',
    rate_login_window_seconds: '',
    rate_email_per_user_per_hour: '',
    alert_level: 'require_verify' as 'require_verify' | 'warn_only',
    notif_success: true,
    notif_failed: true,
    notif_disputes: true,
    notif_payouts: false,
    notif_team: false,
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (!settings) return;

    setFormData({
      smtp_host: settings.smtp_config?.host || '',
      smtp_port: settings.smtp_config?.port?.toString() || '',
      smtp_secure: settings.smtp_config?.secure ?? false,
      smtp_user: settings.smtp_config?.user || '',
      smtp_pass: settings.smtp_config?.pass || '',
      smtp_from_email: settings.smtp_config?.fromEmail || '',
      smtp_from_name: settings.smtp_config?.fromName || '',
      rate_login_attempts: settings.rate_limit?.loginAttempts?.toString() || '',
      rate_login_window_seconds: settings.rate_limit?.loginWindowSeconds?.toString() || '',
      rate_email_per_user_per_hour: settings.rate_limit?.emailPerUserPerHour?.toString() || '',
      alert_level: settings.alert_level || 'require_verify',
      notif_success: settings.notification_defaults?.success ?? true,
      notif_failed: settings.notification_defaults?.failed ?? true,
      notif_disputes: settings.notification_defaults?.disputes ?? true,
      notif_payouts: settings.notification_defaults?.payouts ?? false,
      notif_team: settings.notification_defaults?.team ?? false,
    });
  }, [settings]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (formData.smtp_from_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.smtp_from_email)) {
      nextErrors.smtp_from_email = 'Email người gửi không hợp lệ';
    }

    const numericFields = [
      ['smtp_port', formData.smtp_port, 'SMTP port phải là số'],
      ['rate_login_attempts', formData.rate_login_attempts, 'Số lần đăng nhập phải là số'],
      ['rate_login_window_seconds', formData.rate_login_window_seconds, 'Cửa sổ đăng nhập phải là số'],
      ['rate_email_per_user_per_hour', formData.rate_email_per_user_per_hour, 'Giới hạn email phải là số'],
    ] as const;

    for (const [key, value, message] of numericFields) {
      if (value && Number.isNaN(Number(value))) nextErrors[key] = message;
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại dữ liệu đã nhập');
      return;
    }

    setSaving(true);

    try {
      await dispatch(
        updateSystemSettings({
          smtp_config: {
            host: formData.smtp_host,
            port: Number(formData.smtp_port),
            secure: formData.smtp_secure,
            user: formData.smtp_user,
            pass: formData.smtp_pass,
            fromEmail: formData.smtp_from_email,
            fromName: formData.smtp_from_name,
          },
          rate_limit: {
            loginAttempts: Number(formData.rate_login_attempts),
            loginWindowSeconds: Number(formData.rate_login_window_seconds),
            emailPerUserPerHour: Number(formData.rate_email_per_user_per_hour),
          },
          alert_level: formData.alert_level,
          notification_defaults: {
            success: formData.notif_success,
            failed: formData.notif_failed,
            disputes: formData.notif_disputes,
            payouts: formData.notif_payouts,
            team: formData.notif_team,
          },
        })
      ).unwrap();

      toast.success('Cập nhật cài đặt thành công');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Cài Đặt Hệ Thống</h1>
        <p className="text-gray mt-1">Quản lý cấu hình hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Cấu hình SMTP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">SMTP Host</label>
              <input
                type="text"
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">SMTP Port</label>
              <input
                type="number"
                value={formData.smtp_port}
                onChange={(e) => {
                  setFormData({ ...formData, smtp_port: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, smtp_port: '' }));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="587"
              />
              {validationErrors.smtp_port && <p className="mt-1 text-xs text-red-600">{validationErrors.smtp_port}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">SMTP User</label>
              <input
                type="text"
                value={formData.smtp_user}
                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">SMTP Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtp_pass}
                  onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark text-sm"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">From Email</label>
              <input
                type="email"
                value={formData.smtp_from_email}
                onChange={(e) => {
                  setFormData({ ...formData, smtp_from_email: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, smtp_from_email: '' }));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="noreply@example.com"
              />
              {validationErrors.smtp_from_email && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.smtp_from_email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">From Name</label>
              <input
                type="text"
                value={formData.smtp_from_name}
                onChange={(e) => setFormData({ ...formData, smtp_from_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="HyperPay"
              />
            </div>
          </div>
          <label className="mt-4 inline-flex items-center gap-2 text-sm text-dark">
            <input
              type="checkbox"
              checked={formData.smtp_secure}
              onChange={(e) => setFormData({ ...formData, smtp_secure: e.target.checked })}
              className="rounded"
            />
            Bật kết nối bảo mật (secure)
          </label>
        </div>

        <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Rate limit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Số lần thử đăng nhập</label>
              <input
                type="number"
                value={formData.rate_login_attempts}
                onChange={(e) => {
                  setFormData({ ...formData, rate_login_attempts: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, rate_login_attempts: '' }));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
              {validationErrors.rate_login_attempts && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.rate_login_attempts}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Cửa sổ đăng nhập (giây)</label>
              <input
                type="number"
                value={formData.rate_login_window_seconds}
                onChange={(e) => {
                  setFormData({ ...formData, rate_login_window_seconds: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, rate_login_window_seconds: '' }));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
              {validationErrors.rate_login_window_seconds && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.rate_login_window_seconds}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email mỗi user / giờ</label>
              <input
                type="number"
                value={formData.rate_email_per_user_per_hour}
                onChange={(e) => {
                  setFormData({ ...formData, rate_email_per_user_per_hour: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, rate_email_per_user_per_hour: '' }));
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
              {validationErrors.rate_email_per_user_per_hour && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.rate_email_per_user_per_hour}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Mức cảnh báo</h2>
          <select
            value={formData.alert_level}
            onChange={(e) => setFormData({ ...formData, alert_level: e.target.value as 'require_verify' | 'warn_only' })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="require_verify">require_verify</option>
            <option value="warn_only">warn_only</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Thông báo mặc định</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notif_success} onChange={(e) => setFormData({ ...formData, notif_success: e.target.checked })} className="rounded" /><span className="text-sm text-dark">Giao dịch thành công</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notif_failed} onChange={(e) => setFormData({ ...formData, notif_failed: e.target.checked })} className="rounded" /><span className="text-sm text-dark">Giao dịch thất bại</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notif_disputes} onChange={(e) => setFormData({ ...formData, notif_disputes: e.target.checked })} className="rounded" /><span className="text-sm text-dark">Tranh chấp</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notif_payouts} onChange={(e) => setFormData({ ...formData, notif_payouts: e.target.checked })} className="rounded" /><span className="text-sm text-dark">Payouts</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notif_team} onChange={(e) => setFormData({ ...formData, notif_team: e.target.checked })} className="rounded" /><span className="text-sm text-dark">Thông báo team</span></label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
}
