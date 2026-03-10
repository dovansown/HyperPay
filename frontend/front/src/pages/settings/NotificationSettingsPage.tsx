function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight">Notification settings</h2>
        <p className="mt-2 text-slate-500">Nhận cảnh báo giao dịch, webhook errors và cập nhật billing.</p>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {[
          ['Payment succeeded', 'Nhận email khi giao dịch thành công.'],
          ['Payment failed', 'Cảnh báo ngay khi giao dịch lỗi.'],
          ['Webhook delivery failure', 'Thông báo khi endpoint không phản hồi.'],
          ['Invoice generated', 'Nhận hóa đơn theo chu kỳ billing.'],
        ].map(([title, desc]) => (
          <label key={title} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-primary" />
          </label>
        ))}
      </section>
    </div>
  )
}

export default NotificationSettingsPage
