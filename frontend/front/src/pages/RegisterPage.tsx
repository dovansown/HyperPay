import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuthStore } from '../store/authStore'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    try {
      await register({ full_name: fullName, email, password })
      navigate('/dashboard')
    } catch {
      // lỗi hiển thị qua store
    }
  }

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center bg-background-light p-6">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-white">payments</span>
            <h1 className="text-2xl font-bold tracking-tight">HyperPay</h1>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="mb-2 text-xl font-semibold">Create your account</h2>
            <p className="mb-6 text-sm text-slate-500">Join HyperPay and start processing payments in minutes.</p>
            <form className="space-y-4" onSubmit={onSubmit}>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                placeholder="Full name"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
                placeholder="Password"
              />
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Create account'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default RegisterPage
