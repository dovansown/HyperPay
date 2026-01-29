import { NavLink, Outlet } from 'react-router-dom'
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout'

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-full transition-colors font-bold text-sm'

export function SettingsLayout() {
  return (
    <AuthenticatedLayout containerClassName="max-w-[1300px] mx-auto w-full px-6 py-8">
      <div className="flex gap-8">
        <aside className="w-72 border-r border-[#e6e4db] dark:border-[#3d3a2a] bg-white dark:bg-[#1a180b] hidden lg:flex flex-col sticky top-[72px] h-[calc(100vh-72px)]">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-primary p-2 rounded-full">
                <span className="material-symbols-outlined text-background-dark">
                  account_balance
                </span>
              </div>
              <div>
                <h1 className="text-[#181711] dark:text-white text-lg font-extrabold leading-none">
                  Hero Fintech
                </h1>
                <p className="text-[#8c855f] text-xs font-medium uppercase tracking-wider mt-1">
                  Account Settings
                </p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              <NavLink
                to="/settings/profile"
                className={({ isActive }) =>
                  isActive
                    ? `${linkBase} bg-primary text-background-dark`
                    : `${linkBase} text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]`
                }
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
                Thông tin cá nhân
              </NavLink>
              <NavLink
                to="/settings/logs"
                className={({ isActive }) =>
                  isActive
                    ? `${linkBase} bg-primary text-background-dark`
                    : `${linkBase} text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]`
                }
              >
                <span className="material-symbols-outlined">shield_person</span>
                Nhật kí hoạt động
              </NavLink>
              <NavLink
                to="/settings/plan"
                className={({ isActive }) =>
                  isActive
                    ? `${linkBase} bg-primary text-background-dark`
                    : `${linkBase} text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]`
                }
              >
                <span className="material-symbols-outlined">workspace_premium</span>
                Gói &amp; nạp tiền
              </NavLink>
              <NavLink
                to="/settings/export"
                className={({ isActive }) =>
                  isActive
                    ? `${linkBase} bg-primary text-background-dark`
                    : `${linkBase} text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]`
                }
              >
                <span className="material-symbols-outlined">download</span>
                Xuất dữ liệu
              </NavLink>
              <NavLink
                to="/settings/notifications"
                className={({ isActive }) =>
                  isActive
                    ? `${linkBase} bg-primary text-background-dark`
                    : `${linkBase} text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]`
                }
              >
                <span className="material-symbols-outlined">notifications</span>
                Thông báo
              </NavLink>
            </nav>

            <div className="mt-auto pt-6 border-t border-[#e6e4db] dark:border-[#3d3a2a]">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-cover border border-primary/20" />
                <div>
                  <p className="text-sm font-bold text-[#181711] dark:text-white">
                    Account
                  </p>
                  <p className="text-xs text-[#8c855f]">Settings</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default SettingsLayout

