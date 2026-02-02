import { NavLink, Outlet } from 'react-router-dom'
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout'

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-full transition-colors font-bold text-sm'

export function SettingsLayout() {
  return (
    <AuthenticatedLayout containerClassName="max-w-[1300px] mx-auto w-full px-6 py-8">
      <div className="flex gap-8">
        <div className="w-72 shrink-0 hidden lg:block" aria-hidden>
          {/* Spacer giữ chỗ trong flex, aside thật dùng fixed bên dưới */}
        </div>
        <aside className="fixed top-[92px] left-[max(1.5rem,calc((100vw-1300px)/2+1.5rem))] w-72 bg-white dark:bg-[#1a180b] hidden lg:flex flex-col rounded-[20px] z-40">
          <div className="px-6 py-4 flex flex-col ">
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

