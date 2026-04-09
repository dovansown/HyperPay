import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronDown,
  LayoutDashboard, 
  Landmark,
  Webhook as WebhookIcon,
  CreditCard,
  User,
  LogOut,
  LifeBuoy,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser, logout } from '@/store/slices/authSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from '@/store/slices/notificationsSlice';

export function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const authUser = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.profile.profile);
  const { items: notifications, unreadCount } = useAppSelector((s) => s.notifications);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (!authUser) dispatch(fetchCurrentUser());
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, token, authUser, profile]);

  const displayName = profile?.full_name || authUser?.fullName || authUser?.email || '—';
  const displayEmail = profile?.email || authUser?.email || '—';
  const displayRole = profile?.role || authUser?.role || 'USER';

  return (
    <header className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            className="md:hidden p-2 -ml-2 text-gray hover:text-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-[20px] font-bold text-dark">
            <span className="text-primary">M</span>oneta
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label={t('nav.overview')} active={location.pathname === '/dashboard'} />
            <NavItem to="/bank" icon={<Landmark size={16} />} label={t('nav.bank')} active={location.pathname === '/bank'} />
            <NavItem to="/webhook" icon={<WebhookIcon size={16} />} label={t('nav.webhook')} active={location.pathname.startsWith('/webhook')} />
            <NavItem to="/billing" icon={<CreditCard size={16} />} label={t('nav.billing')} active={location.pathname === '/billing'} />
            <NavItem to="/support" icon={<LifeBuoy size={16} />} label={t('nav.support')} active={location.pathname === '/support'} />
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button 
              onClick={() => { setIsSearchOpen(!isSearchOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
              className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray hover:text-dark hover:bg-gray-100 transition-colors"
            >
              <Search size={18} />
            </button>
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-72 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e8e8e8] p-2 z-50"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={14} />
                    <input 
                      type="text" 
                      placeholder={t('common.search') + "..."}
                      autoFocus
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-lg text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                const nextOpen = !isNotifOpen;
                setIsNotifOpen(nextOpen);
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                if (nextOpen && token) dispatch(fetchNotificationsThunk({ page: 1, limit: 10 }));
              }}
              className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray hover:text-dark hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e8e8e8] overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[#e8e8e8] flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-[14px] font-bold text-dark">{t('dashboard.notifications')}</h3>
                    <button
                      className="text-[11px] text-primary hover:underline font-medium disabled:opacity-60"
                      disabled={!token || unreadCount === 0}
                      onClick={async () => {
                        if (!token) return;
                        await dispatch(markAllNotificationsReadThunk()).unwrap();
                      }}
                    >
                      {t('dashboard.mark_read')}
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[13px] text-gray">Chưa có thông báo</div>
                    ) : (
                      notifications.map((n, idx) => {
                        const isUnread = !n.readAt;
                        const createdAt = new Date(n.createdAt);
                        const timeLabel = Number.isFinite(createdAt.getTime())
                          ? createdAt.toLocaleString()
                          : '';
                        return (
                          <div
                            key={n.id}
                            className={[
                              "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                              idx !== notifications.length - 1 ? "border-b border-[#e8e8e8]" : "",
                            ].join(' ')}
                            onClick={async () => {
                              if (!token) return;
                              if (isUnread) await dispatch(markNotificationReadThunk({ id: n.id })).unwrap();
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-dark mb-1 truncate">{n.title}</div>
                                {n.body && <div className="text-[12px] text-gray line-clamp-2">{n.body}</div>}
                                {timeLabel && (
                                  <div className={cn("text-[11px] font-medium mt-1", isUnread ? "text-primary" : "text-light-gray")}>
                                    {timeLabel}
                                  </div>
                                )}
                              </div>
                              {isUnread && <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-[#e8e8e8] text-center bg-gray-50/50">
                    <button
                      className="text-[12px] text-primary hover:underline font-medium"
                      onClick={() => {
                        setIsNotifOpen(false);
                        // Chưa có trang /notifications, tạm điều hướng sang support (hoặc giữ nguyên)
                      }}
                    >
                      {t('dashboard.view_all')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSearchOpen(false); setIsNotifOpen(false); }}
              className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark"></div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[13px] font-bold text-dark leading-tight">{displayName}</span>
                <span className="text-[11px] text-light-gray leading-tight">{displayRole}</span>
              </div>
              <ChevronDown size={14} className="text-gray" />
            </div>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e8e8e8] py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-[#e8e8e8] mb-1 bg-gray-50/50">
                    <div className="text-[13px] font-bold text-dark">{displayName}</div>
                    <div className="text-[11px] text-gray">{displayEmail}</div>
                  </div>
                  <button 
                    className="w-full px-4 py-2 text-left text-[13px] text-dark hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                  >
                    <User size={14} /> {t('profile.personal')}
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left text-[13px] text-dark hover:bg-gray-50 flex items-center gap-2 transition-colors md:hidden"
                    onClick={() => { setIsProfileOpen(false); navigate('/support'); }}
                  >
                    <LifeBuoy size={14} /> {t('nav.support')}
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setIsProfileOpen(false);
                      dispatch(logout());
                      navigate('/login');
                    }}
                  >
                    <LogOut size={14} /> {t('auth.logout')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center px-4 border-b border-[#e8e8e8] justify-between">
                <Link to="/" className="text-[20px] font-bold text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-primary">M</span>oneta
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray hover:text-dark">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
                <MobileNavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label={t('nav.overview')} active={location.pathname === '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem to="/bank" icon={<Landmark size={18} />} label={t('nav.bank')} active={location.pathname === '/bank'} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem to="/webhook" icon={<WebhookIcon size={18} />} label={t('nav.webhook')} active={location.pathname.startsWith('/webhook')} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem to="/billing" icon={<CreditCard size={18} />} label={t('nav.billing')} active={location.pathname === '/billing'} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavItem to="/support" icon={<LifeBuoy size={18} />} label={t('nav.support')} active={location.pathname === '/support'} onClick={() => setIsMobileMenuOpen(false)} />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavItem({ icon, label, active, to }: { icon: React.ReactNode, label: string, active?: boolean, to: string }) {
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-gray hover:bg-gray-50 hover:text-dark"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ icon, label, active, to, onClick }: { icon: React.ReactNode, label: string, active?: boolean, to: string, onClick: () => void }) {
  return (
    <Link 
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-colors",
        active ? "bg-primary/10 text-primary" : "text-gray hover:bg-gray-50 hover:text-dark"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
