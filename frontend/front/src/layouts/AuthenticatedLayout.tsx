import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
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
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary cursor-pointer"
        aria-label="Profile menu"
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="absolute right-0 top-[52px] w-56 rounded-xl border border-[#e7e5da] dark:border-[#3a3622] bg-white dark:bg-[#1a180b] shadow-2xl overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-background-light dark:hover:bg-[#2c2918] flex items-center gap-2"
            onClick={() => {
              setOpen(false)
              navigate('/settings/profile')
            }}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Cài đặt tài khoản
          </button>
          <button
            type="button"
            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-background-light dark:hover:bg-[#2c2918] flex items-center gap-2 text-red-600 dark:text-red-400"
            onClick={() => {
              setOpen(false)
              logout()
              navigate('/login')
            }}
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function AuthenticatedHeader() {
  return (
    <header className="w-full border-b border-solid border-[#f4f2e6] dark:border-white/10 bg-white/70 dark:bg-background-dark/70 backdrop-blur-md py-3 sticky top-0 z-50">
      <div className="max-w-[1300px] mx-auto w-full flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="size-8 bg-primary rounded-full flex items-center justify-center text-black">
            <span className="material-symbols-outlined text-xl">account_balance</span>
          </div>
          <h2 className="text-lg font-extrabold leading-tight tracking-[-0.015em]">
            Hero Fintech
          </h2>
        </div>
        <label className="flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-[#f4f2e6] dark:bg-white/5 border-none">
            <div className="text-[#a19345] flex items-center justify-center pl-4">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-[#a19345] px-4 pl-2 text-base font-normal"
              placeholder="Search team members"
            />
          </div>
        </label>
        </div>
        <div className="flex flex-1 justify-end gap-8">
        <nav className="hidden lg:flex items-center gap-9">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-semibold text-primary underline underline-offset-4 decoration-2'
                : 'text-sm font-semibold hover:text-primary transition-colors'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-semibold text-primary underline underline-offset-4 decoration-2'
                : 'text-sm font-semibold hover:text-primary transition-colors'
            }
          >
            Transactions
          </NavLink>
          <NavLink
            to="/banks"
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-semibold text-primary underline underline-offset-4 decoration-2'
                : 'text-sm font-semibold hover:text-primary transition-colors'
            }
          >
            Banks
          </NavLink>
          <NavLink
            to="/apis"
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-semibold text-primary underline underline-offset-4 decoration-2'
                : 'text-sm font-semibold hover:text-primary transition-colors'
            }
          >
            APIs
          </NavLink>
          <NavLink
            to="/team/roles"
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-semibold text-primary underline underline-offset-4 decoration-2'
                : 'text-sm font-semibold hover:text-primary transition-colors'
            }
          >
            Team
          </NavLink>
        </nav>
        <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

function AuthenticatedFooter() {
  return (
    <footer className="mt-20 border-t border-[#f4f2e6] dark:border-white/10">
      <div className="max-w-[1300px] mx-auto w-full py-10 px-6 lg:px-10 text-center">
        <p className="text-[#a19345] dark:text-gray-400 font-bold text-sm tracking-widest uppercase">
          Built for Heroes ⚡️ HeroUI Fintech
        </p>
        <div className="mt-4 flex justify-center gap-6 text-[#a19345] dark:text-gray-400 text-sm">
          <a className="hover:text-primary transition-colors" href="#">
            Docs
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Support
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  )
}

interface AuthenticatedLayoutProps {
  children: ReactNode
  containerClassName?: string
}

export function AuthenticatedLayout({
  children,
  containerClassName = 'max-w-[1300px] mx-auto w-full px-6 py-10',
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-[#1d1a0c] dark:text-white transition-colors duration-300">
      <AuthenticatedHeader />
      <main className={`flex-1 ${containerClassName}`}>{children}</main>
      <AuthenticatedFooter />
    </div>
  )
}

export default AuthenticatedLayout

