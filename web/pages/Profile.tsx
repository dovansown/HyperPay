import React, { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PopConfirm } from '@/components/ui/PopConfirm';
import { Modal } from '@/components/ui/Modal';
import { OTPInput } from '@/components/ui/OTPInput';
import { 
  User, Bell, Shield, Link as LinkIcon, 
  Smartphone, Laptop, CheckCircle2,
  Mail, MessageSquare, Facebook, Github, Apple, Slack,
  QrCode, Copy, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changePasswordThunk,
  checkChangePasswordThunk,
  clearBackupCodes,
  disable2FAThunk,
  enable2FAThunk,
  fetchProfile,
  get2FASetupThunk,
  sendChangePasswordCodeThunk,
  sendVerifyEmailCodeThunk,
  updateProfileThunk,
  fetchLoginHistory,
  fetchTrustedDevices,
  removeTrustedDevice,
  fetchNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '@/store/slices/profileSlice';

export function Profile() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('personal');
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchProfile());
  }, [dispatch, token]);

  const tabs = [
    { id: 'personal', label: t('profile.personal'), icon: <User size={18} /> },
    { id: 'notifications', label: t('profile.notifications'), icon: <Bell size={18} /> },
    { id: 'security', label: t('profile.security'), icon: <Shield size={18} /> },
    { id: 'linked', label: t('profile.linked'), icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8 md:items-start">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-24">
          <h1 className="text-[24px] font-bold text-dark mb-4 md:mb-6">{t('profile.settings')}</h1>
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-[13px] md:text-[14px] font-medium transition-all text-left whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray hover:bg-gray-100 hover:text-dark bg-gray-50 md:bg-transparent"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          {activeTab === 'personal' && <PersonalInfo />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'linked' && <LinkedAccounts />}
        </div>
      </main>
    </div>
  );
}

function PersonalInfo() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { profile, status, error, updateStatus, updateError, passwordStatus, passwordError, lastPasswordVerificationId } =
    useAppSelector((s) => s.profile);

  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailVerifyModalOpen, setIsEmailVerifyModalOpen] = useState(false);
  const [passwordCode, setPasswordCode] = useState('');
  const [emailVerifyCode, setEmailVerifyCode] = useState('');
  const [localPasswordError, setLocalPasswordError] = useState<string | null>(null);
  const [localEmailError, setLocalEmailError] = useState<string | null>(null);
  const [emailVerificationId, setEmailVerificationId] = useState<string | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? '');
  }, [profile]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (updateError) toast.error(updateError);
  }, [updateError]);

  useEffect(() => {
    if (passwordError) toast.error(passwordError);
  }, [passwordError]);

  const isLoadingProfile = status === 'loading';
  const isSavingProfile = updateStatus === 'loading';
  const isChangingPassword = passwordStatus === 'loading';

  const beginPasswordFlow = async () => {
    setLocalPasswordError(null);
    if (!currentPassword || !newPassword) {
      setLocalPasswordError(t('common.please_fill_all_fields'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setLocalPasswordError(t('auth.passwords_do_not_match') || 'Mật khẩu không khớp');
      return;
    }
    try {
      await dispatch(checkChangePasswordThunk({ current_password: currentPassword, new_password: newPassword })).unwrap();
      const sendRes = await dispatch(sendChangePasswordCodeThunk()).unwrap();
      if (sendRes.verification_id) {
        setPasswordCode('');
        setIsPasswordModalOpen(true);
        toast.success(t('auth.code_sent') || 'Verification code sent to your email');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate password change';
      setLocalPasswordError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const submitPasswordChange = async () => {
    setLocalPasswordError(null);
    const verificationId = lastPasswordVerificationId;
    if (!verificationId) {
      setLocalPasswordError('Thiếu verification id');
      return;
    }
    if (passwordCode.length !== 6) {
      setLocalPasswordError('Mã xác thực phải đủ 6 số');
      return;
    }
    try {
      await dispatch(
        changePasswordThunk({
          verification_id: verificationId,
          code: passwordCode,
          current_password: currentPassword,
          new_password: newPassword,
        })
      ).unwrap();
      toast.success(t('profile.password_changed') || 'Password changed successfully!');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordCode('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setLocalPasswordError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const sendEmailVerificationCode = async () => {
    setLocalEmailError(null);
    try {
      const result = await dispatch(sendVerifyEmailCodeThunk()).unwrap();
      setEmailVerificationId(result.verification_id);
      setIsEmailVerifyModalOpen(true);
      toast.success(t('auth.code_sent') || 'Verification code sent to your email');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setLocalEmailError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const submitEmailVerification = async () => {
    setLocalEmailError(null);
    if (!emailVerificationId) {
      setLocalEmailError('Thiếu verification id');
      return;
    }
    if (emailVerifyCode.length !== 6) {
      setLocalEmailError('Mã xác thực phải đủ 6 số');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      // Call auth verify endpoint
      const token = await dispatch((_, getState) => getState().auth.token);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          verification_id: emailVerificationId,
          code: emailVerifyCode,
          type: 'email',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || data.message || 'Verification failed');
      }
      
      // Refresh profile
      await dispatch(fetchProfile());
      toast.success(t('auth.email_verified') || 'Email verified successfully!');
      setIsEmailVerifyModalOpen(false);
      setEmailVerifyCode('');
      setEmailVerificationId(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setLocalEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      <h2 className="text-[20px] font-bold text-dark">{t('profile.personal')}</h2>
      
      {/* Email Verification Card */}
      {profile && !profile.email_verified && (
        <Card className="p-6 md:p-8 w-full border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-dark mb-1">{t('profile.verify_email') || 'Verify your email'}</h3>
              <p className="text-[13px] text-gray mb-4">
                {t('profile.verify_email_desc') || 'Please verify your email address to access all features.'}
              </p>
              {localEmailError && (
                <div className="mb-3 text-[13px] text-red-600">{localEmailError}</div>
              )}
              <Button 
                className="px-4 py-2 rounded-xl text-[13px]"
                onClick={sendEmailVerificationCode}
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail ? t('common.loading') : (t('profile.send_verification_code') || 'Send Verification Code')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 md:p-8 w-full">
        <h3 className="text-[16px] font-bold text-dark mb-6">{t('profile.your_profile')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('auth.full_name')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoadingProfile || isSavingProfile}
              className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('profile.phone')}</label>
            <input
              type="tel"
              value=""
              disabled
              placeholder={t('common.coming_soon') || 'Coming soon'}
              className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors disabled:opacity-60"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-bold text-dark mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors disabled:opacity-60"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            className="px-6 py-2.5 rounded-xl"
            disabled={isLoadingProfile || isSavingProfile || !fullName.trim()}
            onClick={async () => {
              try {
                await dispatch(updateProfileThunk({ full_name: fullName.trim() })).unwrap();
                toast.success(t('profile.profile_updated') || 'Profile updated successfully!');
              } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
                toast.error(errorMessage);
              }
            }}
          >
            {isSavingProfile ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 md:p-8 w-full">
        <h3 className="text-[16px] font-bold text-dark mb-6">{t('profile.change_password')}</h3>
        <div className="flex flex-col gap-6 mb-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('profile.current_password')}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-dark mb-2">{t('profile.new_password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-dark mb-2">{t('profile.confirm_new_password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="px-6 py-2.5 rounded-xl" disabled={isChangingPassword} onClick={beginPasswordFlow}>
            {isChangingPassword ? t('common.loading') : t('profile.update_password')}
          </Button>
        </div>
      </Card>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={t('profile.change_password')}>
        <div className="flex flex-col gap-4">
          <div className="text-[13px] text-gray">
            Nhập mã 6 số được gửi về email để xác nhận đổi mật khẩu.
          </div>
          <OTPInput 
            length={6}
            value={passwordCode}
            onChange={setPasswordCode}
            disabled={isChangingPassword}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsPasswordModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 rounded-xl" disabled={isChangingPassword} onClick={submitPasswordChange}>
              {isChangingPassword ? t('common.loading') : t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Verification Modal */}
      <Modal isOpen={isEmailVerifyModalOpen} onClose={() => setIsEmailVerifyModalOpen(false)} title={t('profile.verify_email') || 'Verify Email'}>
        <div className="flex flex-col gap-4">
          <div className="text-[13px] text-gray">
            {t('profile.verify_email_modal_desc') || 'Enter the 6-digit code sent to your email to verify your account.'}
          </div>
          {localEmailError && (
            <div className="text-[13px] text-red-600">{localEmailError}</div>
          )}
          <OTPInput 
            length={6}
            value={emailVerifyCode}
            onChange={setEmailVerifyCode}
            disabled={isVerifyingEmail}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEmailVerifyModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 rounded-xl" disabled={isVerifyingEmail} onClick={submitEmailVerification}>
              {isVerifyingEmail ? t('common.loading') : t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NotificationSettings() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { notificationSettings, notificationSettingsStatus } = useAppSelector((s) => s.profile);

  useEffect(() => {
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      await dispatch(updateNotificationSettings({ [key]: value })).unwrap();
      toast.success(t('profile.settings_updated') || 'Settings updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      toast.error(errorMessage);
    }
  };

  const notifs = notificationSettings || {
    success: true,
    failed: true,
    dispute: true,
    payout: false,
    newMember: true
  };

  const isLoading = notificationSettingsStatus === 'loading';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      <h2 className="text-[20px] font-bold text-dark">{t('profile.notifications')}</h2>
      <Card className="p-6 md:p-8 w-full">
        <div className="mb-6">
          <h3 className="text-[16px] font-bold text-dark">{t('profile.email_notifs')}</h3>
          <p className="text-[13px] text-gray mt-1">{t('profile.email_notifs_desc')}</p>
        </div>
        
        <div className="flex flex-col gap-6">
          <NotifItem 
            title={t('profile.notif_success_title')} 
            desc={t('profile.notif_success_desc')}
            checked={notifs.success}
            onChange={(c) => handleToggle('success', c)}
            disabled={isLoading}
          />
          <hr className="border-[#e8e8e8]" />
          <NotifItem 
            title={t('profile.notif_failed_title')} 
            desc={t('profile.notif_failed_desc')}
            checked={notifs.failed}
            onChange={(c) => handleToggle('failed', c)}
            disabled={isLoading}
          />
          <hr className="border-[#e8e8e8]" />
          <NotifItem 
            title={t('profile.notif_dispute_title')} 
            desc={t('profile.notif_dispute_desc')}
            checked={notifs.dispute}
            onChange={(c) => handleToggle('dispute', c)}
            disabled={isLoading}
          />
          <hr className="border-[#e8e8e8]" />
          <NotifItem 
            title={t('profile.notif_payout_title')} 
            desc={t('profile.notif_payout_desc')}
            checked={notifs.payout}
            onChange={(c) => handleToggle('payout', c)}
            disabled={isLoading}
          />
          <hr className="border-[#e8e8e8]" />
          <NotifItem 
            title={t('profile.notif_member_title')} 
            desc={t('profile.notif_member_desc')}
            checked={notifs.newMember}
            onChange={(c) => handleToggle('newMember', c)}
            disabled={isLoading}
          />
        </div>
      </Card>
    </div>
  );
}

function NotifItem({ title, desc, checked, onChange, disabled }: { title: string, desc: string, checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[14px] font-bold text-dark mb-1">{title}</div>
        <div className="text-[13px] text-gray">{desc}</div>
      </div>
      <div className="pt-1">
        <Switch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

function SecuritySettings() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { profile, twoFASetup, twoFAStatus, twoFAError, lastBackupCodes, loginHistory, trustedDevices, notificationSettings } = useAppSelector((s) => s.profile);
  const twoFactor = !!profile?.totp_enabled;
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [twoFACode, setTwoFACode] = useState('');

  const isWorking2FA = twoFAStatus === 'loading';

  useEffect(() => {
    dispatch(fetchLoginHistory());
    dispatch(fetchTrustedDevices());
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  const handle2FAToggle = (checked: boolean) => {
    if (checked) {
      setIs2FAModalOpen(true);
      setStep(1);
      setTwoFACode('');
      dispatch(get2FASetupThunk());
    } else {
      dispatch(disable2FAThunk())
        .unwrap()
        .then(() => {
          toast.success(t('2fa.disabled') || '2FA disabled successfully!');
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
          toast.error(errorMessage);
        });
    }
  };

  const handleLoginAlertsToggle = async (checked: boolean) => {
    try {
      await dispatch(updateNotificationSettings({ loginAlerts: checked })).unwrap();
      toast.success(t('profile.settings_updated') || 'Settings updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      toast.error(errorMessage);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await dispatch(removeTrustedDevice(deviceId)).unwrap();
      dispatch(fetchTrustedDevices());
      toast.success(t('profile.device_removed') || 'Device removed successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove device';
      toast.error(errorMessage);
    }
  };

  const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const historyColumns: Column<typeof loginHistory[0]>[] = [
    { key: 'date', label: t('common.date'), sortable: true, cellClassName: "text-[13px] text-dark" },
    { key: 'ip', label: t('profile.ip_address'), sortable: true, cellClassName: "text-[13px] text-gray" },
    { key: 'location', label: t('profile.location'), sortable: true, cellClassName: "text-[13px] text-gray" },
    { 
      key: 'status', 
      label: t('common.status'), 
      sortable: true,
      render: (item) => (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold",
          item.status === 'success' ? "bg-[#e8f5ee] text-primary" : "bg-red-50 text-red-500"
        )}>
          {item.status === 'success' ? t('profile.login_success') : t('profile.login_failed')}
        </span>
      )
    }
  ];

  const deviceColumns: Column<typeof trustedDevices[0]>[] = [
    { 
      key: 'device', 
      label: t('profile.device'), 
      sortable: true,
      render: (item) => {
        const icon = item.device.toLowerCase().includes('iphone') || item.device.toLowerCase().includes('android') ? 'smartphone' : 'laptop';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray flex items-center justify-center">
              {icon === 'laptop' ? <Laptop size={14} /> : <Smartphone size={14} />}
            </div>
            <div>
              <div className="text-[13px] font-bold text-dark">{item.device}</div>
              <div className="text-[11px] text-gray">{item.browser}</div>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'lastActive', 
      label: t('profile.last_active'), 
      sortable: true, 
      cellClassName: "text-[13px] text-gray",
      render: (item) => formatRelativeTime(item.lastActive)
    },
    {
      key: 'actions',
      label: '',
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => (
        <PopConfirm
          title={t('profile.remove_device')}
          description={t('profile.remove_device_confirm')}
          onConfirm={() => handleRemoveDevice(item.id)}
          okText={t('profile.remove_device')}
          cancelText={t('common.cancel')}
        >
          <button className="text-[12px] font-bold text-red-500 hover:text-red-600 transition-colors">
            {t('profile.remove_device')}
          </button>
        </PopConfirm>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      <h2 className="text-[20px] font-bold text-dark">{t('profile.security')}</h2>
      
      <Card className="p-6 md:p-8 w-full">
        <div className="flex flex-col gap-6">
          <NotifItem 
            title={t('2fa.title')} 
            desc="Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác nhận khi đăng nhập."
            checked={twoFactor}
            onChange={handle2FAToggle}
          />
          <hr className="border-[#e8e8e8]" />
          <NotifItem 
            title={t('profile.login_alerts')} 
            desc={t('profile.login_alerts_desc')}
            checked={notificationSettings?.loginAlerts ?? true}
            onChange={handleLoginAlertsToggle}
          />
        </div>
      </Card>

      {/* 2FA Modal */}
      <Modal 
        isOpen={is2FAModalOpen} 
        onClose={() => {
          setIs2FAModalOpen(false);
          dispatch(clearBackupCodes());
        }}
        title={t('2fa.title')}
      >
        <div className="flex flex-col gap-6">
          {twoFAError && <div className="text-[13px] text-red-600">{twoFAError}</div>}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Smartphone size={32} />
                </div>
                <h4 className="text-[16px] font-bold text-dark mb-2">{t('2fa.step1_title')}</h4>
                <p className="text-[13px] text-gray">{t('2fa.step1_desc')}</p>
              </div>

              <div className="flex justify-center p-4 bg-white border border-[#e8e8e8] rounded-2xl">
                {twoFASetup?.qrDataUrl ? (
                  <img
                    src={twoFASetup.qrDataUrl}
                    alt="2FA QR"
                    className="w-40 h-40 rounded-xl border border-[#e8e8e8]"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                    <QrCode size={120} className="text-dark" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-[#e8e8e8] rounded-xl p-4">
                <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('2fa.manual_entry')}</div>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-[14px] font-mono font-bold text-dark">{twoFASetup?.secret ?? ''}</code>
                  <button
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={async () => {
                      const text = twoFASetup?.secret ?? '';
                      if (!text) return;
                      try {
                        await navigator.clipboard.writeText(text);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIs2FAModalOpen(false)}>{t('common.cancel')}</Button>
                <Button className="flex-1 rounded-xl" disabled={isWorking2FA || !twoFASetup?.secret} onClick={() => setStep(2)}>
                  {isWorking2FA ? t('common.loading') : t('2fa.next')}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Shield size={32} />
                </div>
                <h4 className="text-[16px] font-bold text-dark mb-2">{t('2fa.step2_title')}</h4>
                <p className="text-[13px] text-gray">{t('2fa.step2_desc')}</p>
              </div>

              <OTPInput 
                length={6}
                value={twoFACode}
                onChange={setTwoFACode}
                disabled={isWorking2FA}
              />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>{t('2fa.back')}</Button>
                <Button 
                  className="flex-1 rounded-xl" 
                  disabled={isWorking2FA || twoFACode.length !== 6}
                  onClick={async () => {
                    try {
                      await dispatch(enable2FAThunk({ code: twoFACode })).unwrap();
                      toast.success(t('2fa.enabled') || '2FA enabled successfully!');
                      setStep(3);
                    } catch (err: unknown) {
                      const errorMessage = err instanceof Error ? err.message : 'Failed to enable 2FA';
                      toast.error(errorMessage);
                    }
                  }}
                >
                  {isWorking2FA ? t('common.loading') : t('2fa.complete')}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-dark">Bật 2FA thành công</div>
                  <div className="text-[12px] text-gray">Lưu backup codes ở nơi an toàn. Bạn sẽ chỉ thấy 1 lần.</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(lastBackupCodes ?? []).map((c) => (
                  <div key={c} className="px-3 py-2 rounded-lg bg-gray-50 border border-[#e8e8e8] text-[12px] font-mono font-bold text-dark">
                    {c}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={async () => {
                    const text = (lastBackupCodes ?? []).join('\n');
                    if (!text) return;
                    try {
                      await navigator.clipboard.writeText(text);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  {t('common.copy') || 'Copy'}
                </Button>
                <Button className="flex-1 rounded-xl" onClick={() => setIs2FAModalOpen(false)}>
                  {t('common.done') || 'Done'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <h3 className="text-[16px] font-bold text-dark mt-2">{t('profile.trusted_devices')}</h3>
      <Card className="p-0 overflow-hidden w-full">
        <DataTable 
          columns={deviceColumns}
          data={trustedDevices}
          defaultPageSize={5}
          pageSizeOptions={[5, 10]}
        />
      </Card>

      <h3 className="text-[16px] font-bold text-dark mt-2">{t('profile.login_history')}</h3>
      <Card className="p-0 overflow-hidden w-full">
        <DataTable 
          columns={historyColumns}
          data={loginHistory}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </div>
  );
}

function LinkedAccounts() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      <h2 className="text-[20px] font-bold text-dark">{t('profile.linked')}</h2>
      
      <Card className="p-6 md:p-8 w-full">
        <h3 className="text-[16px] font-bold text-dark mb-1">{t('nav.login')}</h3>
        <p className="text-[13px] text-gray mb-6">{t('profile.social_login_desc')}</p>
        
        <div className="flex flex-col gap-4">
          <LinkedItem name="Google" icon={<Mail size={18} />} status={t('profile.linked_status')} connected />
          <LinkedItem name="Facebook" icon={<Facebook size={18} />} status={t('profile.not_linked_status')} />
          <LinkedItem name="Apple" icon={<Apple size={18} />} status={t('profile.not_linked_status')} />
        </div>
      </Card>

      <Card className="p-6 md:p-8 w-full">
        <h3 className="text-[16px] font-bold text-dark mb-1">{t('profile.activity_notifs')}</h3>
        <p className="text-[13px] text-gray mb-6">{t('profile.activity_notifs_desc')}</p>
        
        <div className="flex flex-col gap-4">
          <LinkedItem name="Zalo" icon={<MessageSquare size={18} />} status={t('profile.linked_status')} connected />
          <LinkedItem name="Telegram" icon={<MessageSquare size={18} />} status={t('profile.not_linked_status')} />
          <LinkedItem name="Discord" icon={<MessageSquare size={18} />} status={t('profile.not_linked_status')} />
          <LinkedItem name="Slack" icon={<Slack size={18} />} status={t('profile.not_linked_status')} />
        </div>
      </Card>
    </div>
  );
}

function LinkedItem({ name, icon, status, connected }: { name: string, icon: React.ReactNode, status: string, connected?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-4 border border-[#e8e8e8] rounded-xl bg-gray-50/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white border border-[#e8e8e8] flex items-center justify-center text-dark">
          {icon}
        </div>
        <div>
          <div className="text-[14px] font-bold text-dark">{name}</div>
          <div className={cn("text-[12px]", connected ? "text-primary font-medium" : "text-gray")}>
            {status}
          </div>
        </div>
      </div>
      <Button variant={connected ? "outline" : "primary"} className="px-4 py-2 rounded-lg text-[12px]">
        {connected ? t('profile.unlink') : t('profile.link_now')}
      </Button>
    </div>
  );
}
