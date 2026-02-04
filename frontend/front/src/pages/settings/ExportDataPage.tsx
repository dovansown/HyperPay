import { useState } from 'react'
import Button from '../../components/ui/Button'
import { banks } from '../../mocks/data'
import { Table, Thead, Tbody, Th, Td } from '../../components/ui/Table'
import DateRangePicker from '../../components/ui/DateRangePicker'

export function ExportDataPage() {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')
  const [selectedBanks, setSelectedBanks] = useState<string[]>([
    'VCB', "BIDV"
  ])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  return (

    <>
    <header className="px-8 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 text-[#8c855f] text-sm font-bold">
          <span className="hover:text-primary transition-colors cursor-default">
            Tài khoản
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#181711] dark:text-white">Xuất dữ liệu &amp; Báo cáo</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            
            <p className="text-[#8c855f] dark:text-[#a19b80] text-sm font-medium">
            Cấu hình và tạo báo cáo giao dịch ngân hàng của bạn một cách dễ dàng.
            </p>
          </div>
        </div>
      </header>
    <div className="max-w-[1300px] mx-auto px-8">
      

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white dark:bg-[#1c1a0e] rounded-lg p-6 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-black size-8 flex items-center justify-center rounded-full font-bold text-sm">
                1
              </span>
              <h2 className="text-base font-bold">Chọn khoảng thời gian</h2>
            </div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start)
                setEndDate(end)
              }}
            />
          </div>

          <div className="bg-white dark:bg-[#1c1a0e] rounded-lg p-6 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-black size-8 flex items-center justify-center rounded-full font-bold text-sm">
                2
              </span>
              <h2 className="text-base font-bold">Lọc theo ngân hàng &amp; Trạng thái</h2>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-bold text-[#898361] mb-3 uppercase tracking-wider">
                  Chọn ngân hàng
                </p>
                <div className="flex flex-wrap gap-2">
                  {banks.map((bank) => (
                    <Button key={bank.code} variant={selectedBanks.includes(bank.code) ? 'primary' : 'outline'} type="button" onClick={() => setSelectedBanks([...selectedBanks, bank.code])}>
                      {bank.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#898361] mb-3 uppercase tracking-wider">
                  Trạng thái giao dịch
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 rounded-full border border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>{' '}
                    Hoàn thành
                  </div>
                  <div className="px-4 py-2 rounded-full border border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">schedule</span> Chờ xử lý
                  </div>
                  <div className="px-4 py-2 rounded-full border border-[#181711]/10 dark:border-white/10 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">cancel</span> Thất bại
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white dark:bg-[#1c1a0e] rounded-lg p-6  dark:border-white/5">
            <h3 className="font-bold text-base mb-4">Định dạng xuất</h3>
            <div className="grid grid-cols-2 gap-2 bg-background-light dark:bg-black/20 p-1 rounded-full">
              <button
                className={`py-2 px-4 rounded-full font-bold text-sm ${
                  format === 'csv'
                    ? 'bg-white dark:bg-[#2d2a1a] shadow-sm'
                    : 'text-[#898361]'
                }`}
                onClick={() => setFormat('csv')}
                type="button"
              >
                .CSV
              </button>
              <button
                className={`py-2 px-4 rounded-full font-bold text-sm ${
                  format === 'xlsx'
                    ? 'bg-white dark:bg-[#2d2a1a] shadow-sm'
                    : 'text-[#898361]'
                }`}
                onClick={() => setFormat('xlsx')}
                type="button"
              >
                .XLSX
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#898361]">Số dòng ước tính</span>
                <span className="font-bold">~1,240</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#898361]">Kích thước ước tính</span>
                <span className="font-bold">2.4 MB</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-6">
              Tạo báo cáo
            </Button>
          </div>

          <div className="bg-[#181711] text-white rounded-lg p-8 flex flex-col items-center text-center">
            <div className="mb-4 relative">
              <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center text-4xl">
                🍳
              </div>
              <div className="absolute -top-1 -right-1 size-6 bg-primary text-black rounded-full flex items-center justify-center text-xs font-bold">
                Hot
              </div>
            </div>
            <h4 className="text-xl font-black mb-2 text-primary">
              Báo cáo của bạn đang được &quot;nấu&quot; chín...
            </h4>
            <p className="text-white/60 text-sm mb-6">
              Server của chúng tôi đang thu thập các nguyên liệu cho báo cáo của bạn.
            </p>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden relative">
              <div className="h-full bg-primary w-[65%] rounded-full transition-all duration-1000 relative">
                <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex justify-between w-full text-[10px] font-bold tracking-widest uppercase opacity-40">
              <span>Đang chuẩn bị</span>
              <span>65%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-4 rounded-lg">
        
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <Thead>
              <tr>
                <Th>Tên file</Th>
                <Th>Ngày tạo</Th>
                <Th>Loại</Th>
                <Th>Kích thước</Th>
                <Th className="text-right">Hành động</Th>
              </tr>
            </Thead>
            <Tbody>
              <tr className="hover:bg-primary/5 transition-colors">
                <Td className="font-bold">Q3_Transaction_Summary.csv</Td>
                <Td className="text-sm opacity-70">
                  24/10/2023, 11:42 AM
                </Td>
                <Td>
                  <span className="px-2 py-1 rounded-md bg-background-light dark:bg-white/10 text-xs font-bold">
                    CSV
                  </span>
                </Td>
                <Td className="text-sm">2.4 MB</Td>
                <Td className="text-right">
                  <button className="text-primary hover:underline text-sm font-bold">
                    Tải xuống
                  </button>
                </Td>
              </tr>
            </Tbody>
          </Table>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 hidden lg:flex items-center gap-4 bg-white dark:bg-[#1c1a0e] p-4 rounded-lg shadow-2xl border border-primary/20">
        <div className="size-12 bg-primary rounded-full flex items-center justify-center text-xl shadow-inner">
          ✨
        </div>
        <div>
          <p className="font-black text-sm">Báo cáo sẵn sàng!</p>
          <p className="text-xs text-[#898361]">Báo cáo của bạn đã sẵn sàng.</p>
        </div>
        <button className="ml-4 p-1 hover:bg-background-light dark:hover:bg-white/10 rounded-full">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
    </>
  )
}

export default ExportDataPage

