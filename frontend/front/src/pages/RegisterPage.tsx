import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [fullName, setFullName] = useState('Nguyen Van A')
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('123456')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await register({ full_name: fullName, email, password })
      navigate('/dashboard')
    } catch {
      // error trong store
    }
  }

  return (
    <MainLayout>
      <main className="flex flex-col items-center justify-center px-4 pt-4 pb-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-80px-96px)]">
        <div className="w-full max-w-[520px] mb-8">
          <div className="flex flex-col gap-3 px-4">
            <div className="flex gap-6 justify-between items-center">
              <p className="text-[#1d1a0c] dark:text-white text-sm font-bold uppercase tracking-widest">
                Account Creation
              </p>
              <p className="text-[#1d1a0c] dark:text-white text-sm font-bold">
                Step 1 of 3
              </p>
            </div>
            <div className="rounded-full bg-[#eae5cd] dark:bg-zinc-800 h-2 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '33%' }} />
            </div>
          </div>
        </div>

        <div className="mb-10 text-center max-w-2xl px-4">
          <h1 className="text-[#1d1a0c] dark:text-white tracking-tight text-2xl md:text-3xl font-extrabold leading-tight mb-4">
            Bắt đầu hành trình Fintech của bạn ngay hôm nay 🎉
          </h1>
          <p className="text-[#a19345] dark:text-gray-400 text-base font-medium">
            Join 10,000+ businesses managing transactions with Hero efficiency.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 w-full max-w-[520px] rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] p-8 md:p-12 border border-white dark:border-zinc-800">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              placeholder="Enter your superhero name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              iconLeft={<span className="material-symbols-outlined">person</span>}
              rounded="full"
            />
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={<span className="material-symbols-outlined">mail</span>}
              rounded="full"
            />
            <Input
              label="Create Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconLeft={<span className="material-symbols-outlined">lock</span>}
              rounded="full"
            />

            <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-[#a19345] dark:text-gray-400 uppercase tracking-widest px-1 mb-1">
                Security Score
              </p>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#34D399] text-base font-bold">
                  check_circle
                </span>
                <span className="text-sm font-medium text-[#1d1a0c] dark:text-gray-300">
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#34D399] text-base font-bold">
                  check_circle
                </span>
                <span className="text-sm font-medium text-[#1d1a0c] dark:text-gray-300">
                  At least one number (0-9)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-300 dark:text-zinc-600 text-base">
                  circle
                </span>
                <span className="text-sm font-medium text-gray-400">
                  One special character (!@#)
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              rightIcon={
                <span className="material-symbols-outlined font-bold">
                  arrow_forward
                </span>
              }
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Create My Account'}
            </Button>

            <div className="flex flex-col gap-4 mt-4">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100 dark:border-zinc-800" />
                <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-100 dark:border-zinc-800" />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full border border-[#eae5cd] dark:border-zinc-700 py-3"
                  leftIcon={
                    <img
                      alt="Google Logo"
                      className="w-5 h-5"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmlzAihksW3C7mjKFOVTIetfRnVeVjXRLDZnh2CISa9jb9M5-xa6cmNGOJRh-h9vnE9S57sVMmTZVAYXsWIoehzFHqS2mIGN0b4voiRhECnSaH4FuaB63BW6qWLcGHWRblOwWCgqWNqRnN8wmnRXKrvyMoxkSVL_YYZY51eykOp1xEKtB32dQV4Xn5yGd-arYMY-7UF1SaStjytptxeSPZ9lRxzUjQGyb4BulER8-n94AmKp2sPWpNx0bt0rJ0SrMtBRA6N-MveMNE"
                    />
                  }
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full border border-[#eae5cd] dark:border-zinc-700 py-3"
                  leftIcon={
                    <span className="material-symbols-outlined text-xl">terminal</span>
                  }
                >
                  Github
                </Button>
              </div>
            </div>
          </form>

          <footer className="mt-8 text-center flex flex-col gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Already have an account?
              <Link
                to="/login"
                className="text-[#1d1a0c] dark:text-white font-bold underline decoration-primary decoration-4 underline-offset-2 ml-1"
              >
                Log in
              </Link>
            </p>
            <p className="text-[10px] text-gray-400 px-6 leading-relaxed">
              By clicking &quot;Create My Account&quot;, you agree to Hero Fintech&apos;s{' '}
              <a className="underline" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="underline" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </footer>
        </div>
      </main>
    </MainLayout>
  )
}

export default RegisterPage

