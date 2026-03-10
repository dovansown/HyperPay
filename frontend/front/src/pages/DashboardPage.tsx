import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Dashboard Overview</h1>
            <p className="mt-2 text-slate-500">Bản giao diện mới lấy phần content từ `dash.html`.</p>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20">
            Create payment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Balance', '$128,430.00', '+12.5% this month'],
            ['Today Revenue', '$4,250.50', '+8.2% from yesterday'],
            ['Successful Payments', '1,240', '+5.1% since Monday'],
            ['Failed Payments', '12', '-2.4% vs last week'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{note}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Revenue over time</h2>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600">7 Days</button>
              <button className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white">30 Days</button>
            </div>
          </div>
          <div className="h-64 rounded-xl bg-gradient-to-b from-primary/10 to-transparent" />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold">Latest Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Transaction ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['#HP-12845', 'Oct 24, 2023 10:45 AM', 'Succeeded', '$450.00'],
                  ['#HP-12844', 'Oct 24, 2023 09:12 AM', 'Succeeded', '$1,200.50'],
                  ['#HP-12843', 'Oct 23, 2023 11:59 PM', 'Failed', '$32.00'],
                ].map(([id, date, status, amount]) => (
                  <tr key={id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 text-sm font-semibold">{id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{date}</td>
                    <td className="px-6 py-4 text-sm">{status}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  )
}

export default DashboardPage
