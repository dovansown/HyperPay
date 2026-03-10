import { NavLink, Outlet } from 'react-router-dom'
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout'

const settingNavItems = [
  { to: '/settings/profile', label: 'General' },
  { to: '/settings/logs', label: 'Activity logs' },
  { to: '/settings/plan', label: 'Billing' },
  { to: '/settings/export', label: 'Export' },
  { to: '/settings/notifications', label: 'Notifications' },
]

function SettingsLayout() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="mt-2 text-slate-500">Layout sau đăng nhập dùng header từ `setting.html`, phần dưới chỉ là content của từng màn.</p>
        </div>

        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max gap-8">
            {settingNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${isActive ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'} border-b-2 pb-3 text-sm font-semibold`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <Outlet />
      </div>
    </AuthenticatedLayout>
  )
}

export default SettingsLayout
