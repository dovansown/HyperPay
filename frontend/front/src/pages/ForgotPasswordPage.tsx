import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('user@example.com')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccess(false)
    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch {
      // error handled via store
    }
  }

  return (
    <MainLayout>
      <div className="bg-background-light dark:bg-background-dark min-h-[calc(100vh-80px-96px)] flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-primary/5 rounded-full blur-2xl" />
          <div className="w-full max-w-[480px] z-10">
            <div className="bg-white dark:bg-[#1f1e16] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#e7e5da] dark:border-[#3a372a] p-8 md:p-12">
              <div className="text-center space-y-3 mb-10">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-[32px] font-semibold">
                    lock_reset
                  </span>
                </div>
                <h1 className="text-[#181710] dark:text-white text-2xl font-extrabold tracking-tight">
                  Quên mật khẩu?
                </h1>
            <p className="text-[#5c5944] dark:text-[#b0ad98] text-sm leading-relaxed">
                  Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập! 🔑
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Địa chỉ Email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  iconLeft={<span className="material-symbols-outlined">mail</span>}
                  rounded="full"
                />

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={isLoading}
                  rightIcon={<span className="material-symbols-outlined">send</span>}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <Link
                  to="/login"
                  className="text-[#5c5944] dark:text-[#b0ad98] font-semibold text-sm hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  Quay lại trang đăng nhập
                </Link>
              </div>

              {success && (
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#e6fcf5] dark:bg-[#0ca678]/10 rounded-full border border-[#0ca678]/20">
                    <span className="material-symbols-outlined text-[#0ca678] text-[20px]">
                      mark_email_read
                    </span>
                    <span className="text-[#0ca678] font-bold text-sm tracking-wide">
                      Email đã được gửi! Kiểm tra hộp thư nhé 💌
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  )
}

export default ForgotPasswordPage

