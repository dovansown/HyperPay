import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('123456')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch {

      console.log("error")
      // error đã lưu trong store
    }
  }

  return (
    <MainLayout>
      <div className="relative flex min-h-[calc(100vh-80px-96px)] w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Left visual as in design */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-accent-purple/40 dark:bg-zinc-900 p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mb-48" />
            <div className="relative z-10 max-w-lg">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-background-dark">
                  <span className="material-symbols-outlined text-2xl">
                    shield_person
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">HyperPay</h2>
              </div>
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg mb-12 shadow-2xl shadow-[#6366f1]/20"
                data-alt="Illustration of a friendly superhero managing digital bank accounts"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCH7QWlXi2KQMd64Uj1kg2SLzzzQ7XqBhlAG1B04Wwcn2OQzHzQbV0ru4LT0U_FR4nDNZj81gRsc5MOP_EXFr2wbELALGXlmslCKug_NECmTa4QMp8D3WMj_Kuy5AbEr9dwZzRP2AhktWFeZtlgJfVT8Weci2tFBSHKyzqiqlWbcAyoKD0CmMRs-kAOthstV48Oeb6DTRxkeSKsee20kcu_crFinZaFHHzYlLUHwRBf30aFZscktAnNaqFXiAkFmP-j7EIq_eP5I7Du")',
                }}
              />
              <div className="space-y-4">
                <h1 className="text-3xl font-black leading-tight tracking-tight text-[#1d1a0c] dark:text-white">
                  Chào mừng Hero trở lại! 🚀
                </h1>
                <p className="text-base text-[#5e5a40] dark:text-zinc-400 font-medium leading-relaxed">
                  Quản lý giao dịch ngân hàng và API thanh toán của bạn một cách dễ dàng
                  với nền tảng bảo mật chuẩn quốc tế.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4 p-4 rounded-lg bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/40">
                <span className="material-symbols-outlined text-[#6366f1]">
                  verified_user
                </span>
                <p className="text-sm font-semibold">
                  Dữ liệu của bạn được mã hóa 256-bit chuẩn quân đội
                </p>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-24 bg-background-light dark:bg-background-dark">
              <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-base text-[#1d1a0c]">
                  bolt
                </span>
              </div>
              <span className="text-base font-bold">HyperPay</span>
            </div>
            <div className="w-full max-w-[440px]">
              <div className="mb-10 text-left">
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  Đăng nhập tài khoản
                </h2>
                <p className="text-[#5e5a40] dark:text-zinc-400">
                  Vui lòng nhập thông tin để truy cập bảng điều khiển
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Địa chỉ Email"
                  type="email"
                  placeholder="hero@fintech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  iconLeft={<span className="material-symbols-outlined">mail</span>}
                  rounded="full"
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconLeft={<span className="material-symbols-outlined">lock</span>}
                  rounded="full"
                />

                <div className="flex items-center justify-between py-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="rounded-md border-[#eae5cd] text-primary focus:ring-primary h-5 w-5 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="font-medium text-[#5e5a40] dark:text-zinc-400 group-hover:text-[#1d1a0c] dark:group-hover:text-zinc-200">
                      Ghi nhớ tôi
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-[#6366f1] hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
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
                    <span className="material-symbols-outlined">arrow_forward</span>
                  }
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-[#5e5a40] dark:text-zinc-400 font-medium">
                  Bạn chưa có tài khoản?
                  <Link
                    to="/register"
                    className="text-[#1d1a0c] dark:text-white font-bold hover:text-[#6366f1] transition-colors ml-1 underline decoration-primary decoration-4 underline-offset-4"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default LoginPage

