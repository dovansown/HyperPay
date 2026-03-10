import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch {
      // lỗi hiển thị qua store
    }
  }

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 flex items-center gap-2">
            <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-white">payments</span>
            <span className="text-2xl font-bold tracking-tight">HyperPay</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h1 className="mb-8 text-2xl font-semibold">Sign in to your account</h1>
            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                  placeholder="jane.doe@example.com"
                />
              </label>
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Continue'}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  )
}

export default LoginPage
