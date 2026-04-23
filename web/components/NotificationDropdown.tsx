import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
  type NotificationItem,
} from '@/store/slices/notificationsSlice';
import { useLanguage } from '@/context/LanguageContext';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: NotificationItem['type']): string {
  switch (type) {
    case 'SYSTEM':
      return '⚙️';
    case 'WEBHOOK':
      return '🔗';
    case 'BILLING':
      return '💳';
    case 'SECURITY':
      return '🔒';
    case 'SUPPORT':
      return '💬';
    default:
      return '📢';
  }
}

export function NotificationDropdown() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const items = useAppSelector((s) => s.notifications.items);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const status = useAppSelector((s) => s.notifications.status);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      void dispatch(fetchNotificationsThunk({ limit: 20 }));
    }
  }, [isOpen, status, dispatch]);

  // Auto-refresh every 30 seconds when dropdown is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      void dispatch(fetchNotificationsThunk({ limit: 20 }));
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, dispatch]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dispatch(markNotificationReadThunk({ id }));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsReadThunk());
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        className="relative p-2 text-gray hover:text-dark hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-[#e8e8e8] z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
              <h3 className="text-[14px] font-bold text-dark">
                {t('notifications.title') || 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <button
                  className="text-[12px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck size={14} />
                  {t('notifications.mark_all_read') || 'Mark all as read'}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {status === 'loading' && items.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-gray">
                  {t('common.loading') || 'Loading...'}
                </div>
              )}

              {status === 'succeeded' && items.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <div className="text-[13px] text-gray">
                    {t('notifications.empty') || 'No notifications yet'}
                  </div>
                </div>
              )}

              {items.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-[#e8e8e8] hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.readAt ? 'bg-primary/5' : ''
                  }`}
                  onClick={(e) => {
                    if (!notification.readAt) {
                      void handleMarkAsRead(notification.id, e);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-dark line-clamp-1">
                          {notification.title}
                        </h4>
                        {!notification.readAt && (
                          <button
                            className="flex-shrink-0 p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            title={t('notifications.mark_read') || 'Mark as read'}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-[12px] text-gray mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <div className="text-[11px] text-gray mt-1.5">
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-4 py-2 border-t border-[#e8e8e8] text-center">
                <button
                  className="text-[12px] font-bold text-primary hover:text-primary-dark transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if exists
                  }}
                >
                  {t('notifications.view_all') || 'View all notifications'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
