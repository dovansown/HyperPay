import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

function LandingPage() {
  return (
    <MainLayout>
      <div className="bg-background-light text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined rounded-lg bg-primary p-1.5 text-white">bolt</span>
              <span className="text-xl font-black tracking-tight">HyperPay</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Đăng nhập
              </Link>
              <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                HyperPay Commerce
              </p>
              <h1 className="text-5xl font-black leading-tight tracking-tight">Hạ tầng thanh toán toàn cầu cho doanh nghiệp hiện đại</h1>
              <p className="text-lg text-slate-600">
                Dựa trên phong cách mới từ bộ thiết kế, HyperPay giúp bạn nhận thanh toán, quản lý giao dịch và mở rộng đa thị trường.
              </p>
              <div className="flex gap-3">
                <Link to="/register" className="rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20">
                  Tạo tài khoản
                </Link>
                <Link to="/login" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700">
                  Vào dashboard
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-bold">Mô hình tăng trưởng</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Doanh thu hôm nay</span>
                  <span className="font-bold">$4,250.50</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Thanh toán thành công</span>
                  <span className="font-bold">1,240</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Tài khoản ngân hàng liên kết</span>
                  <span className="font-bold">8</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}

export default LandingPage
