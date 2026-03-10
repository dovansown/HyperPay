function ActivityLogsPage() {
  const logs = [
    { event: 'payment_intent.succeeded', status: '200 OK', time: '2 min ago' },
    { event: 'customer.created', status: '200 OK', time: '14 min ago' },
    { event: 'charge.failed', status: '500 ERR', time: '1 hour ago' },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-1">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Recent Logs</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.event} className="p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{log.event}</p>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{log.status}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{log.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-slate-950 shadow-sm lg:col-span-2">
        <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-200">Response Payload</h3>
        </div>
        <pre className="overflow-auto p-6 text-xs leading-relaxed text-slate-300">{`{
  "id": "evt_1Mv2ZzLkdIwHu7ixJjZg8Fz8",
  "type": "payment_intent.succeeded",
  "created": 1681228499,
  "data": {
    "object": {
      "id": "pi_3Mv2ZzLkdIwHu7ix1pTY7p9I",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}`}</pre>
      </section>
    </div>
  )
}

export default ActivityLogsPage
