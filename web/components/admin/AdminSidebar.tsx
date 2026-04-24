import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Landmark,
  Clock,
  UserCog,
  Webhook,
  ArrowLeftRight,
  Settings,
  ChevronLeft,
  X,
  Menu,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: '/admin', label: t('admin.dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: t('admin.users'), icon: <Users size={20} /> },
    { path: '/admin/packages', label: t('admin.packages'), icon: <Package size={20} /> },
    { path: '/admin/banks', label: t('admin.banks'), icon: <Landmark size={20} /> },
    { path: '/admin/durations', label: t('admin.durations'), icon: <Clock size={20} /> },
    { path: '/admin/user-packages', label: t('admin.userPackages'), icon: <UserCog size={20} /> },
    { path: '/admin/webhooks', label: t('admin.webhooks'), icon: <Webhook size={20} /> },
    { path: '/admin/transactions', label: t('admin.transactions'), icon: <ArrowLeftRight size={20} /> },
    { path: '/admin/settings', label: t('admin.settings'), icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray hover:text-dark"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-[#e8e8e8] transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#e8e8e8]">
          {!isCollapsed && (
            <Link to="/" className="text-[20px] font-bold text-dark">
              <span className="text-primary">M</span>oneta
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft
              size={18}
              className={cn('text-gray transition-transform', isCollapsed && 'rotate-180')}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.path}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* Footer - Back to Dashboard */}
        <div className="p-4 border-t border-[#e8e8e8]">
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium text-gray hover:bg-gray-50 hover:text-dark transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <Home size={20} />
            {!isCollapsed && <span>{t('admin.backToDashboard')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#e8e8e8]">
                <Link to="/" className="text-[20px] font-bold text-dark" onClick={() => setIsMobileOpen(false)}>
                  <span className="text-primary">M</span>oneta
                </Link>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray hover:text-dark">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <SidebarNavItem
                      key={item.path}
                      to={item.path}
                      icon={item.icon}
                      label={item.label}
                      active={location.pathname === item.path}
                      collapsed={false}
                      onClick={() => setIsMobileOpen(false)}
                    />
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-[#e8e8e8]">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium text-gray hover:bg-gray-50 hover:text-dark transition-colors"
                >
                  <Home size={20} />
                  <span>{t('admin.backToDashboard')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function SidebarNavItem({ to, icon, label, active, collapsed, onClick }: SidebarNavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-gray hover:bg-gray-50 hover:text-dark',
        collapsed && 'justify-center'
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
