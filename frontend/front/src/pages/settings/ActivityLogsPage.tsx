import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export function ActivityLogsPage() {
  return (
    <div className="max-w-[1300px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#1d1a0c] dark:text-white">
              Security &amp; Audit Logs
            </h2>
            <p className="text-[#a19345] mt-2 font-medium">
              Real-time transparency into your system&apos;s critical activities.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 px-6 h-12 bg-white dark:bg-[#2d2a15] border border-[#eae5cd] dark:border-[#3d3a25] rounded-full text-sm font-bold shadow-sm">
              <span className="material-symbols-outlined text-base">download</span>
              Export Logs
            </button>
            <button className="flex items-center justify-center gap-2 px-6 h-12 bg-primary text-[#1d1a0c] rounded-full text-sm font-bold shadow-md">
              <span className="material-symbols-outlined text-base">refresh</span>
              Live Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#2d2a15] p-6 rounded-lg border border-[#eae5cd] dark:border-[#3d3a25] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-[#a19345] text-sm font-bold uppercase tracking-wide">
                Total Events (24h)
              </p>
              <span className="material-symbols-outlined text-[#7c3aed]">analytics</span>
            </div>
            <p className="text-2xl font-black text-[#1d1a0c] dark:text-white">1,284</p>
            <p className="text-green-600 text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +12.5%
            </p>
          </div>
          <div className="bg-white dark:bg-[#2d2a15] p-6 rounded-lg border border-[#eae5cd] dark:border-[#3d3a25] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-[#a19345] text-sm font-bold uppercase tracking-wide">
                Failed Logins
              </p>
              <span className="material-symbols-outlined text-red-500">lock_open</span>
            </div>
            <p className="text-2xl font-black text-[#1d1a0c] dark:text-white">12</p>
            <p className="text-red-500 text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span> High Risk
            </p>
          </div>
          <div className="bg-white dark:bg-[#2d2a15] p-6 rounded-lg border border-[#eae5cd] dark:border-[#3d3a25] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-[#a19345] text-sm font-bold uppercase tracking-wide">
                Active API Keys
              </p>
              <span className="material-symbols-outlined text-primary">key</span>
            </div>
            <p className="text-2xl font-black text-[#1d1a0c] dark:text-white">4</p>
            <p className="text-[#a19345] text-sm font-bold">Consistent with last week</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#a19345]">
              search
            </span>
            <Input
              className="h-14 pl-12"
              placeholder="Search IP, User, or Event Type..."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-[#1d1a0c] rounded-full text-sm font-bold">
              All Events
              <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2d2a15] border border-[#eae5cd] dark:border-[#3d3a25] rounded-full text-sm font-bold">
              Critical Level
              <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2d2a15] border border-[#eae5cd] dark:border-[#3d3a25] rounded-full text-sm font-bold">
              API Actions
              <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2d2a15] border border-[#eae5cd] dark:border-[#3d3a25] rounded-full text-sm font-bold ml-auto">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Last 7 Days
            </button>
          </div>
        </div>

        <div className="relative ml-5">
          <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-[#eae5cd]" />

          {/* Timeline Item 1 */}
          <div className="relative pl-12 pb-10">
            <div className="absolute left-0 top-0 size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-4 border-background-light dark:border-background-dark z-10">
              <span className="material-symbols-outlined text-red-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <div className="bg-white dark:bg-[#2d2a15] p-5 rounded-2xl border-2 border-red-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#1d1a0c] dark:text-white">
                    Production API Key Rotated
                  </h4>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full tracking-wider">
                    Critical
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#a19345]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    alex_admin@bank.com
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    San Francisco, US • 192.168.1.1
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1d1a0c] dark:text-white">
                  2 minutes ago
                </p>
                <button className="text-[#7c3aed] text-xs font-bold hover:underline mt-1">
                  View JSON Metadata
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Item 2 */}
          <div className="relative pl-12 pb-10">
            <div className="absolute left-0 top-0 size-10 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background-light dark:border-background-dark z-10">
              <span className="material-symbols-outlined text-[#1d1a0c] text-base">
                login
              </span>
            </div>
            <div className="bg-white dark:bg-[#2d2a15] p-5 rounded-2xl border border-[#eae5cd] dark:border-[#3d3a25] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#1d1a0c] dark:text-white">
                    New Dashboard Login
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full tracking-wider">
                    Success
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#a19345]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    sarah_dev@bank.com
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">laptop_mac</span>
                    London, UK • 84.19.22.102
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1d1a0c] dark:text-white">
                  14 minutes ago
                </p>
                <button className="text-[#7c3aed] text-xs font-bold hover:underline mt-1">
                  Audit Trace
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Item 3 */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-4 border-background-light dark:border-background-dark z-10">
              <span className="material-symbols-outlined text-orange-600 text-base">
                gpp_maybe
              </span>
            </div>
            <div className="bg-white dark:bg-[#2d2a15] p-5 rounded-2xl border border-[#eae5cd] dark:border-[#3d3a25] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#1d1a0c] dark:text-white">
                    Incorrect Admin Password Attempt
                  </h4>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full tracking-wider">
                    Warning
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#a19345]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    root_admin (Alias)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">public</span>
                    Unknown Location • 45.1.33.2
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1d1a0c] dark:text-white">
                  1 hour ago
                </p>
                <button className="text-red-500 text-xs font-bold hover:underline mt-1">
                  Block IP Address
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="secondary" size="md">
            Load Older Activities
          </Button>
        </div>
    </div>
  )
}

export default ActivityLogsPage

