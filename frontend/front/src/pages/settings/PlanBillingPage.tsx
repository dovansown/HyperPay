import { useEffect } from 'react'
import Button from '../../components/ui/Button'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table'
import { usePlansStore } from '../../store/plansStore'

export function PlanBillingPage() {
  const { plans, fetchPlans, isLoading, error } = usePlansStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return (
    <div className="max-w-[1300px] mx-auto">
      <header className="p-8 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 text-[#8c855f] text-sm font-bold">
          <span className="hover:text-primary transition-colors cursor-default">
            Tài khoản
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#181711] dark:text-white">Quản lý gói dịch vụ</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[#181711] dark:text-white text-base font-bold tracking-tight mb-4">
              Quản lý gói dịch vụ
            </h1>
            <p className="text-[#8c855f] dark:text-[#a19b80] text-sm font-medium">
              Quản lý gói dịch vụ của bạn
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-6 rounded-lg bg-white dark:bg-[#1a180c] p-8">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-black dark:text-primary text-[10px] font-bold uppercase tracking-wider w-fit mb-2">
                  Gói hiện tại
                </span>
                <p className="text-[#181710] dark:text-white text-base font-black">
                  Gói HyperPay Pro
                </p>
                <p className="text-[#8d865e] text-sm font-medium">
                  Ngày thanh toán tiếp theo:{' '}
                  <span className="text-[#181710] dark:text-white font-bold">
                    12/10/2023  
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center rounded-full h-10 px-6 bg-[#f5f4f0] dark:bg-[#2d2a1a] text-[#181710] dark:text-white text-sm font-bold border border-transparent hover:border-primary transition-all">
                  Thay đổi gói
                </button>
                <button className="flex items-center justify-center rounded-full h-10 px-6 text-[#8d865e] text-sm font-bold hover:text-red-500 transition-all">
                  Hủy gói
                </button>
              </div>
            </div>
            <div className="hidden sm:block w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
              <span className="material-symbols-outlined text-5xl text-primary">
                rocket_launch
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-base font-bold tracking-tight">
              Giới hạn sử dụng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1a180c] p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-[#8d865e]">Yêu cầu API</p>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    HOẠT ĐỘNG
                  </span>
                </div>
                <p className="text-xl font-black mb-1">
                  850,000{' '}
                  <span className="text-sm font-normal text-[#8d865e]">/ 1.0M</span>
                </p>
                <div className="w-full bg-[#f5f4f0] dark:bg-[#2d2a1a] h-4 rounded-full overflow-hidden mb-2">
                  <div className="bg-primary h-full rounded-full w-[85%]" />
                </div>
                <p className="text-xs text-[#8d865e] font-medium text-right">
                  85% giới hạn hàng tháng
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a180c] p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-[#8d865e]">GIAO DỊCH</p>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    HOẠT ĐỘNG
                  </span>
                </div>
                <p className="text-xl font-black mb-1">
                  12,400 <span className="text-sm font-normal text-[#8d865e]">/ 20k</span>
                </p>
                <div className="w-full bg-[#f5f4f0] dark:bg-[#2d2a1a] h-4 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#181710] dark:bg-primary h-full rounded-full w-[62%]" />
                </div>
                <p className="text-xs text-[#8d865e] font-medium text-right">
                  62% giới hạn hàng tháng
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-base font-bold tracking-tight">
              Gói dịch vụ có sẵn (API)
            </h2>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <div className="bg-white dark:bg-[#1a180c] rounded-lg border border-[#e5e4de] dark:border-[#3d3a2a] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#f5f4f0] dark:bg-[#2d2a1a] text-[#8d865e] text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tên</th>
                    <th className="px-6 py-4">Giá (VND)</th>
                    <th className="px-6 py-4">Thời lượng</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e4de] dark:divide-[#3d3a2a]">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold">{p.name}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {p.price_vnd.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-sm">{p.duration_days} days</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" disabled={isLoading}>
                          Chọn
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!plans.length && !isLoading && (
                    <tr>
                      <td className="px-6 py-6 text-sm text-[#8d865e]" colSpan={4}>
                        Không có gói dịch vụ nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-base font-bold tracking-tight">
              Hóa đơn gần đây
            </h2>
            <Table className="text-left">
              <Thead className="bg-[#f5f4f0] dark:bg-[#2d2a1a]">
                <tr>
                  <Th className="text-[#8d865e]">Ngày</Th>
                  <Th className="text-[#8d865e]">Mã hóa đơn</Th>
                  <Th className="text-[#8d865e]">Số tiền</Th>
                  <Th className="text-right text-[#8d865e]">Hành động</Th>
                </tr>
              </Thead>
              <Tbody>
                <tr className="hover:bg-primary/5 transition-colors">
                  <Td className="text-sm font-medium">12/10/2023</Td>
                  <Td className="text-sm font-mono text-[#8d865e]">INV-88219-B</Td>
                  <Td className="text-sm font-bold">129.000 VND</Td>
                  <Td className="text-right">
                    <button className="text-primary hover:underline text-sm font-bold">
                      Xem PDF
                    </button>
                  </Td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <Td className="text-sm font-medium">12/08/2023</Td>
                  <Td className="text-sm font-mono text-[#8d865e]">INV-87114-A</Td>
                  <Td className="text-sm font-bold">129.000 VND</Td>
                  <Td className="text-right">
                    <button className="text-primary hover:underline text-sm font-bold">
                      Xem PDF
                    </button>
                  </Td>
                </tr>
              </Tbody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-[#181710] text-white p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-[-20px] right-[-20px] size-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,217,0,0.4)]">
                <span className="material-symbols-outlined text-black text-3xl font-black">
                  diamond
                </span>
              </div>
              <h3 className="text-xl font-black mb-3">Gói HyperPay Pro</h3>
              <p className="text-[#8d865e] text-sm leading-relaxed mb-6">
                Mở khóa API không giới hạn, SLAs tùy chỉnh, và hỗ trợ ưu tiên đặc biệt cho
                toàn bộ đội ngũ của bạn.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base">
                    check_circle
                  </span>
                  Giao dịch không giới hạn
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base">
                    check_circle
                  </span>
                  Điểm cuối tùy chỉnh
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base">
                    check_circle
                  </span>
                  99.99% Uptime SLA
                </li>
              </ul>
              <button className="w-full py-4 rounded-full bg-primary text-black font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                Nâng cấp ngay
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-[#1a180c] p-6">
            <h3 className="text-base font-bold mb-4">Phương thức thanh toán</h3>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5 mb-4">
              <div className="size-10 bg-[#181710] rounded flex items-center justify-center text-white font-bold text-[10px]">
                MOMO
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-bold">0909000000</p>
                <p className="text-xs text-[#8d865e]">Hạn sử dụng 12/26</p>
              </div>
              <button className="material-symbols-outlined text-[#8d865e] hover:text-primary transition-colors">
                edit
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 h-10 rounded-full border border-dashed border-[#8d865e] text-[#8d865e] text-sm font-bold hover:bg-[#f5f4f0] transition-colors">
              <span className="material-symbols-outlined text-base">add</span>
              Thêm phương thức thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanBillingPage

