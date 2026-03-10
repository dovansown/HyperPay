function ExportDataPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight">Export data</h2>
        <p className="mt-2 text-slate-500">Xuất dữ liệu hoạt động, hóa đơn và giao dịch để phục vụ kiểm toán nội bộ.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Tax Reports</h3>
          <p className="mt-2 text-sm text-slate-500">Download data for your tax filings.</p>
          <button className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Export CSV</button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Billing history</h3>
          <p className="mt-2 text-sm text-slate-500">Tải toàn bộ invoice theo tháng.</p>
          <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Export all</button>
        </div>
      </section>
    </div>
  )
}

export default ExportDataPage
