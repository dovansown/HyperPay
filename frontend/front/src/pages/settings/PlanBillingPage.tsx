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
      <div className="flex flex-wrap gap-2 py-2 text-sm">
        <span className="text-[#8d865e] font-medium">Settings</span>
        <span className="text-[#8d865e] font-medium">/</span>
        <span className="text-[#181710] dark:text-white font-bold">Plan &amp; Billing</span>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-3 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#181710] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Plan &amp; Billing
          </h1>
          <p className="text-[#8d865e] text-base font-normal">
            Manage your subscription, usage limits, and invoices.
          </p>
        </div>
        <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-[#f5f4f0] dark:bg-[#2d2a1a] text-[#181710] dark:text-white text-sm font-bold hover:bg-primary hover:text-white transition-all">
          <span>Manage Subscription</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white dark:bg-[#1a180c] p-8 shadow-sm border border-[#e5e4de] dark:border-[#3d3a2a]">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-black dark:text-primary text-[10px] font-bold uppercase tracking-wider w-fit mb-2">
                  Current Plan
                </span>
                <p className="text-[#181710] dark:text-white text-3xl font-black">
                  Pro Hero Plan
                </p>
                <p className="text-[#8d865e] text-sm font-medium">
                  Next billing date:{' '}
                  <span className="text-[#181710] dark:text-white font-bold">
                    Oct 12, 2023
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center rounded-full h-10 px-6 bg-[#f5f4f0] dark:bg-[#2d2a1a] text-[#181710] dark:text-white text-sm font-bold border border-transparent hover:border-primary transition-all">
                  Change Plan
                </button>
                <button className="flex items-center justify-center rounded-full h-10 px-6 text-[#8d865e] text-sm font-bold hover:text-red-500 transition-all">
                  Cancel
                </button>
              </div>
            </div>
            <div className="hidden sm:block w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
              <span className="material-symbols-outlined text-6xl text-primary">
                rocket_launch
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-[22px] font-bold tracking-[-0.015em]">
              Usage Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1a180c] p-6 rounded-xl border border-[#e5e4de] dark:border-[#3d3a2a] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-[#8d865e]">API REQUESTS</p>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    ACTIVE
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  850,000{' '}
                  <span className="text-sm font-normal text-[#8d865e]">/ 1.0M</span>
                </p>
                <div className="w-full bg-[#f5f4f0] dark:bg-[#2d2a1a] h-4 rounded-full overflow-hidden mb-2">
                  <div className="bg-primary h-full rounded-full w-[85%]" />
                </div>
                <p className="text-xs text-[#8d865e] font-medium text-right">
                  85% of monthly limit
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a180c] p-6 rounded-xl border border-[#e5e4de] dark:border-[#3d3a2a] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-[#8d865e]">TRANSACTIONS</p>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    ACTIVE
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  12,400 <span className="text-sm font-normal text-[#8d865e]">/ 20k</span>
                </p>
                <div className="w-full bg-[#f5f4f0] dark:bg-[#2d2a1a] h-4 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#181710] dark:bg-primary h-full rounded-full w-[62%]" />
                </div>
                <p className="text-xs text-[#8d865e] font-medium text-right">
                  62% of monthly limit
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-[22px] font-bold tracking-[-0.015em]">
              Available Plans (API)
            </h2>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <div className="bg-white dark:bg-[#1a180c] rounded-xl border border-[#e5e4de] dark:border-[#3d3a2a] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#f5f4f0] dark:bg-[#2d2a1a] text-[#8d865e] text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Price (VND)</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4 text-right">Action</th>
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
                          Select
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!plans.length && !isLoading && (
                    <tr>
                      <td className="px-6 py-6 text-sm text-[#8d865e]" colSpan={4}>
                        Không có gói nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-[#181710] dark:text-white text-[22px] font-bold tracking-[-0.015em]">
              Recent Invoices
            </h2>
            <Table className="text-left">
              <Thead className="bg-[#f5f4f0] dark:bg-[#2d2a1a]">
                <tr>
                  <Th className="text-[#8d865e]">Date</Th>
                  <Th className="text-[#8d865e]">Invoice ID</Th>
                  <Th className="text-[#8d865e]">Amount</Th>
                  <Th className="text-right text-[#8d865e]">Action</Th>
                </tr>
              </Thead>
              <Tbody>
                <tr className="hover:bg-primary/5 transition-colors">
                  <Td className="text-sm font-medium">Sep 12, 2023</Td>
                  <Td className="text-sm font-mono text-[#8d865e]">INV-88219-B</Td>
                  <Td className="text-sm font-bold">$129.00</Td>
                  <Td className="text-right">
                    <button className="text-primary hover:underline text-sm font-bold">
                      PDF
                    </button>
                  </Td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <Td className="text-sm font-medium">Aug 12, 2023</Td>
                  <Td className="text-sm font-mono text-[#8d865e]">INV-87114-A</Td>
                  <Td className="text-sm font-bold">$129.00</Td>
                  <Td className="text-right">
                    <button className="text-primary hover:underline text-sm font-bold">
                      PDF
                    </button>
                  </Td>
                </tr>
              </Tbody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-[#181710] text-white p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-[-20px] right-[-20px] size-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,217,0,0.4)]">
                <span className="material-symbols-outlined text-black text-4xl font-black">
                  diamond
                </span>
              </div>
              <h3 className="text-2xl font-black mb-3">Go Enterprise</h3>
              <p className="text-[#8d865e] text-sm leading-relaxed mb-6">
                Unlock unlimited API calls, custom SLAs, and dedicated priority support for
                your entire team.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  Unlimited transactions
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  Custom Endpoints
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  99.99% Uptime SLA
                </li>
              </ul>
              <button className="w-full py-4 rounded-full bg-primary text-black font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                Upgrade Now
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#1a180c] p-6 border border-[#e5e4de] dark:border-[#3d3a2a] shadow-sm">
            <h3 className="text-lg font-bold mb-4">Payment Method</h3>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
              <div className="size-10 bg-[#181710] rounded flex items-center justify-center text-white font-bold text-[10px]">
                VISA
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-bold">•••• 4242</p>
                <p className="text-xs text-[#8d865e]">Expires 12/26</p>
              </div>
              <button className="material-symbols-outlined text-[#8d865e] hover:text-primary transition-colors">
                edit
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 h-10 rounded-full border border-dashed border-[#8d865e] text-[#8d865e] text-sm font-bold hover:bg-[#f5f4f0] transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              Add New Method
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanBillingPage

