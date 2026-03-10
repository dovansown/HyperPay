import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuthStore } from '../store/authStore'

function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    setSuccess(false)
    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch {
      // lỗi hiển thị qua store
    }
  }

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
        <div className="w-full max-w-[440px] rounded-xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-primary">lock_reset</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Nhập email đã đăng ký, hệ thống sẽ gửi đường dẫn để đặt lại mật khẩu.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
            />
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">Đã gửi email khôi phục.</p>}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading ? 'Đang gửi...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ForgotPasswordPage
