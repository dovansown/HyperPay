import { useEffect } from 'react'
import { usePlansStore } from '../../store/plansStore'

function PlanBillingPage() {
  const { plans, isLoading, error, fetchPlans } = usePlansStore()

  useEffect(() => {
    void fetchPlans()
  }, [fetchPlans])

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight">Billing Settings</h2>
        <p className="mt-2 text-slate-500">Nội dung theo phong cách `billing.html`, giữ lại block quan trọng nhất.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Current plan</h3>
        {isLoading && <p className="text-sm text-slate-500">Đang tải gói cước...</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {!isLoading && plans.length === 0 && <p className="text-sm text-slate-500">Chưa có dữ liệu plan từ backend.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan</p>
              <p className="mt-1 text-lg font-bold">{plan.name}</p>
              <p className="text-sm text-slate-500">{plan.description}</p>
              <p className="mt-3 text-sm font-semibold text-primary">{plan.price_vnd.toLocaleString('vi-VN')} VND</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PlanBillingPage
