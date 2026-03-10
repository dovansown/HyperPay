import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function ProfileMenu() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        aria-label="Profile menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="material-symbols-outlined text-[20px]">account_circle</span>
      </button>
      {open && (
        <div className="absolute right-0 top-[48px] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => {
              setOpen(false)
              navigate('/settings/profile')
            }}
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span className="truncate">Cai dat tai khoan</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-slate-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-slate-800"
            onClick={() => {
              setOpen(false)
              logout()
              navigate('/login')
            }}
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="truncate">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}

function AuthenticatedHeader() {
  const settingsClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-primary text-sm font-semibold border-b-2 border-primary pb-1'
      : 'text-slate-600 text-sm font-medium hover:text-primary transition-colors'

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900 lg:px-10">
      <div className="flex items-center gap-4 text-primary">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="size-6">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-slate-100">HyperPay</h2>
        </Link>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'text-primary text-sm font-semibold border-b-2 border-primary pb-1'
                : 'text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/banks"
            className={({ isActive }) =>
              isActive
                ? 'text-primary text-sm font-semibold border-b-2 border-primary pb-1'
                : 'text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors'
            }
          >
            Payments
          </NavLink>
          <NavLink
            to="/team/roles"
            className={({ isActive }) =>
              isActive
                ? 'text-primary text-sm font-semibold border-b-2 border-primary pb-1'
                : 'text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors'
            }
          >
            Customers
          </NavLink>
          <NavLink
            to="/apis"
            className={({ isActive }) =>
              isActive
                ? 'text-primary text-sm font-semibold border-b-2 border-primary pb-1'
                : 'text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors'
            }
          >
            Reports
          </NavLink>
          <NavLink
            to="/settings/profile"
            className={settingsClassName}
          >
            Settings
          </NavLink>
          <NavLink
            to="/settings/logs"
            className={settingsClassName}
          >
            Logs
          </NavLink>
          <NavLink
            to="/settings/plan"
            className={settingsClassName}
          >
            Billing
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

interface AuthenticatedLayoutProps {
  children: ReactNode
  containerClassName?: string
}

export function AuthenticatedLayout({
  children,
  containerClassName = 'mx-auto w-full max-w-[1200px] px-4 py-8 lg:px-10',
}: AuthenticatedLayoutProps) {
  const navigate = useNavigate()
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  if (!token) return null

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <AuthenticatedHeader />
      <main className={`flex-1 pt-18 ${containerClassName}`}>{children}</main>
    </div>
  )
}

export default AuthenticatedLayout

