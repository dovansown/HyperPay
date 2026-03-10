function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight">Tax settings</h2>
        <p className="mt-2 text-slate-500">Phần content lấy từ `setting.html` (đã bỏ sidebar/header cũ).</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Tax reports</h3>
          <div className="flex gap-2">
            <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Export CSV</button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Generate 1099</button>
          </div>
        </div>
        <p className="text-sm text-slate-500">Download data for your tax filings.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Tax calculation settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border-2 border-primary bg-primary/5 p-4">
            <p className="text-sm font-bold uppercase tracking-wider">Automatic</p>
            <p className="mt-1 text-sm text-slate-500">HyperPay automatically calculates tax based on customer location.</p>
          </label>
          <label className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">Manual</p>
            <p className="mt-1 text-sm text-slate-500">Set fixed tax rates manually for each region and product.</p>
          </label>
        </div>
      </section>
    </div>
  )
}

export default ProfileSettingsPage
