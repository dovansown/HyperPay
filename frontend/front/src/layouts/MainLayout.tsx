import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from '../components/ui/Button'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-[#1c1a0d] dark:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#f4f2e6] dark:border-[#3a3620]">
        <div className="max-w-[1300px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[#1c1a0d] font-bold">
                bolt
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">HyperPay</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold">
            <NavLink to="/" className="hover:text-primary transition-colors">
              Sản phẩm
            </NavLink>
            <a href="#developers" className="hover:text-primary transition-colors">
              Lập trình viên
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors">
              Bảng giá
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:flex"
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Đăng nhập
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.location.href = '/register'
              }}
            >
              Bắt đầu ngay
            </Button>
          </div>
        </div>
      </header>
      <main className="pt-20 flex-1">{children}</main>
      <footer className="py-12 px-6 bg-white dark:bg-[#1c1a0d] border-t border-[#f4f2e6] dark:border-[#3a3620]">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-[#1c1a0d] text-[18px] font-bold">
                bolt
              </span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">HyperPay</h2>
          </div>
          <p className="text-sm text-[#9e9147]">
            © 2024 HyperPay. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a className="hover:text-primary transition-colors" href="#">
              Twitter
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              LinkedIn
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout

