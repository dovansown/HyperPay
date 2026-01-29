import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

export function DashboardPage() {
  return (
    <AuthenticatedLayout containerClassName="max-w-[1300px] mx-auto w-full px-6 lg:px-10 py-8">
      {/* System Status Action Panel */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-background-dark border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 rounded-lg">
          <div className="flex items-center gap-4 mb-4 md:mb-0 md:flex-1">
            <div className="flex items-center justify-center size-10 bg-[#34D399]/20 rounded-full">
              <span className="material-symbols-outlined text-[#34D399] font-bold">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">
                All systems operational 🟢
              </p>
              <p className="text-zinc-500 text-sm font-normal">
                Global API status is stable across all 12 regions.
              </p>
            </div>
          </div>
          <a className="text-sm font-bold flex items-center gap-2 text-[#4C51BF] hover:underline md:ml-6" href="#">
            View live status page
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Page Heading */}
      <div className="mb-10">
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
          Good morning, Hero! 👋
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-base">
          Here's a high-level overview of your bank transactions and API health.
        </p>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-[#2d2a1a] rounded-lg p-8 border border-zinc-100 dark:border-zinc-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-primary/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-background-dark font-bold">
                payments
              </span>
            </div>
            <span className="bg-[#34D399]/10 text-[#34D399] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              +12.5%
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-1">
            Today's Total 💰
          </p>
          <p className="text-3xl font-extrabold tracking-tighter">$42,500.00</p>
          <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Target: $50k</span>
            <div className="h-1.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[85%] rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2d2a1a] rounded-lg p-8 border border-zinc-100 dark:border-zinc-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] hover:border-[#4C51BF]/50 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-[#4C51BF]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#4C51BF] font-bold">
                query_stats
              </span>
            </div>
            <span className="bg-[#34D399]/10 text-[#34D399] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              +8.2%
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-1">
            New Transactions 📈
          </p>
          <p className="text-3xl font-extrabold tracking-tighter">1,284</p>
          <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
            <div className="flex -space-x-2">
              <img
                alt="user"
                className="size-6 rounded-full border-2 border-white dark:border-zinc-800"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWtFIKOUvnANIz3U2bolSEDDCmc0Wv0Pnczd8M4kfMuvz3zCjDDjgYjljF2fq-GSRQDlp1QHTDYCygOI4VJzcS2Xw_6yvNVjd5GDA6meByrFCaIYTdhIFSesRJ5F-ZnPVhoV8hmvivQKuJOIpO8ho9rEP9T-1UPle-aX0QhhrU5xVWnj5Sg5Yk9Olwyv6gt5T9fGvEUTNTrB932_e4D_QWOTVdbOLQI-cSbUx5ZYAafOoD2vMkVUzdH3DboNqI2S0R4PJvwop4dHSz"
              />
              <img
                alt="user"
                className="size-6 rounded-full border-2 border-white dark:border-zinc-800"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2OUG4B-dGWWEY0FhpfY_7czMCPOqfytHRFAmODCnphy-sd7Uow2soRa8UqX0C2Bx9474UWSBtw95B44HslNDbTDjoR1AWaHRbyBgMokL_QZFVZ4kpvRkTZYjbXTIo7i0M2Z6egi3JU-7uz7JN5rPY357tzqoO3uldEzsSvuctpTP2R93ZiYx_8Onw0Qy0ELmLUoOAqup8z5vbSKv8hBJvIq5QKRUb9woumBxBSX-HXvKBPJWUXpDUIc409ZzS4Ala_nhRyxOid_y_"
              />
              <img
                alt="user"
                className="size-6 rounded-full border-2 border-white dark:border-zinc-800"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1dFUmUJJSBRSVe814ZLeKJS-j4YlaXW5TWG8QnkOVA1CguM7ZKTOKTFaJE5NGIpDGs8I7_Nl-jK-pUGArckj9trmmfWH1L4Q4typ4WF56W-wC5UmUqYsT4qpkpSH1InUntkEUfIaGILeimdOBb5O9rc60LdEicIihhkprzGTUdarTMF4NGwwjj1ewEpIjiSdZjqLaa6ijdJGbFAIevxqqchz2HIMvI4Zk57cXPCmxXmsWEP7rsI53TnDb3voDxwiM6ieBDd-GzrZt"
              />
              <div className="size-6 rounded-full border-2 border-white dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-[8px] font-bold">
                +24
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2d2a1a] rounded-lg p-8 border border-zinc-100 dark:border-zinc-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] hover:border-[#34D399]/50 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-[#34D399]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#34D399] font-bold">
                bolt
              </span>
            </div>
            <span className="text-[#34D399] flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
              <span className="size-2 bg-[#34D399] rounded-full animate-pulse" /> Stable
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-1">
            API Uptime ⚡️
          </p>
          <p className="text-3xl font-extrabold tracking-tighter">99.99%</p>
          <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex items-center gap-1">
            <div className="h-4 w-full flex items-end gap-0.5">
              <div className="bg-[#34D399] w-full h-full rounded-sm opacity-20" />
              <div className="bg-[#34D399] w-full h-[80%] rounded-sm opacity-40" />
              <div className="bg-[#34D399] w-full h-full rounded-sm opacity-60" />
              <div className="bg-[#34D399] w-full h-[90%] rounded-sm" />
              <div className="bg-[#34D399] w-full h-full rounded-sm" />
              <div className="bg-[#34D399] w-full h-full rounded-sm" />
              <div className="bg-[#34D399] w-full h-full rounded-sm" />
              <div className="bg-[#34D399] w-full h-[95%] rounded-sm" />
              <div className="bg-[#34D399] w-full h-full rounded-sm" />
              <div className="bg-[#34D399] w-full h-[85%] rounded-sm opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold tracking-tight">Recent Activity Overview</h3>
        <button className="text-sm font-bold text-[#4C51BF] bg-[#4C51BF]/10 px-4 py-2 rounded-full hover:bg-[#4C51BF] hover:text-white transition-all">
          View Full Report
        </button>
      </div>

      {/* Activity Table Mockup */}
      <div className="bg-white dark:bg-background-dark border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">
                  Transaction
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-zinc-600">
                        shopping_bag
                      </span>
                    </div>
                    <span className="font-bold">Apple Store, San Francisco</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">-$1,299.00</td>
                <td className="px-6 py-4">
                  <span className="bg-[#34D399]/10 text-[#34D399] px-3 py-1 rounded-full text-xs font-bold">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-sm">Oct 24, 2023</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-zinc-600">
                        account_balance_wallet
                      </span>
                    </div>
                    <span className="font-bold">Inbound Wire - Stripe Inc.</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-[#34D399]">+$14,500.00</td>
                <td className="px-6 py-4">
                  <span className="bg-[#34D399]/10 text-[#34D399] px-3 py-1 rounded-full text-xs font-bold">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-sm">Oct 23, 2023</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-zinc-600">
                        public
                      </span>
                    </div>
                    <span className="font-bold">AWS Cloud Services</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">-$450.12</td>
                <td className="px-6 py-4">
                  <span className="bg-primary/20 text-background-dark px-3 py-1 rounded-full text-xs font-bold">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-sm">Oct 22, 2023</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default DashboardPage
