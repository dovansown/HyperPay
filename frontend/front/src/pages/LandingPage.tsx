import MainLayout from '../layouts/MainLayout'

export function LandingPage() {
  return (
    <MainLayout>
      {/* Hero Section (landing1) */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6">
        <div className="max-w-[1300px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-[#9e9147] px-4 py-1.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-xs font-bold tracking-wide uppercase">
                Vừa ra mắt: API v3.0
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#1c1a0d] dark:text-white">
              Ngân hàng thông minh, <span className="text-primary italic">Dev tự tin 🚀</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6b6645] dark:text-[#a8a48d] max-w-[540px]">
              API mạnh mẽ, giao diện thân thiện, giúp doanh nghiệp bứt phá mọi rào cản
              tài chính. Tích hợp thanh toán chỉ trong vài phút.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="h-14 px-8 rounded-full bg-primary text-[#1c1a0d] text-base font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all">
                Dùng thử miễn phí
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="h-14 px-8 rounded-full bg-[#f4f2e6] dark:bg-[#3a3620] text-[#1c1a0d] dark:text-white text-base font-bold flex items-center justify-center gap-2 border border-[#e9e5ce] dark:border-[#4a452a] hover:bg-white dark:hover:bg-black transition-all">
                Tài liệu API
                <span className="material-symbols-outlined">code</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 bg-white dark:bg-[#2d2a15] rounded-xl shadow-2xl border border-[#e9e5ce] dark:border-[#4a452a] p-4 transform rotate-1 lg:rotate-2">
              <div
                className="w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden"
                data-alt="Vibrant fintech dashboard showing transaction charts and financial data"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCpYRnyOPB7HFvs-cXkiPOV1WLYh1HCyXLDdbjIoHlxDnzepWy77R5ofzWLSEJ-GUfj3jS3IB2p15TYtKhIS-go_1_STvUPuPx45wcn_naQjfzjQeujUDmm_kj-TKctOxwXcJxbuwpYSvECvgkY3cmZjDetxLOtLKlrgQKwbjjC4j1XZNEZPP0bFBT0kt63BQ98GxpwdsRmhjhludYGIyx-BhA_A829GYulGT4ifbdjdQTu1f4HevC96nxxrpY6a4DO1N8Q-mDwRVns")',
                }}
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/40 blur-[80px] rounded-full -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* Social Proof (landing1) */}
      <section className="py-12 bg-white dark:bg-[#2d2a15] border-y border-[#f4f2e6] dark:border-[#3a3620]">
        <div className="max-w-[1300px] mx-auto px-6 text-center">
          <h4 className="text-[#9e9147] text-sm font-bold uppercase tracking-[0.2em] mb-10">
            Tin dùng bởi 500+ doanh nghiệp hàng đầu
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="h-8 w-32 bg-[#e2e2e2] dark:bg-[#4a452a] rounded-lg" />
            <div className="h-8 w-32 bg-[#d2d2d2] dark:bg-[#3a3620] rounded-lg" />
            <div className="h-8 w-32 bg-[#e2e2e2] dark:bg-[#4a452a] rounded-lg" />
            <div className="h-8 w-32 bg-[#d2d2d2] dark:bg-[#3a3620] rounded-lg" />
            <div className="h-8 w-32 bg-[#e2e2e2] dark:bg-[#4a452a] rounded-lg" />
          </div>
        </div>
      </section>

      {/* Value Proposition (landing1) */}
      <section className="py-24 px-6 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1300px] mx-auto flex flex-col gap-16">
          <div className="max-w-[720px]">
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Tại sao chọn Hero?
            </h2>
            <p className="text-lg text-[#6b6645] dark:text-[#a8a48d]">
              Nền tảng của chúng tôi được thiết kế để cân bằng giữa sự mạnh mẽ của hệ
              thống tài chính và sự linh hoạt của các công cụ lập trình hiện đại.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white dark:bg-[#2d2a15] p-10 rounded-xl border border-[#e9e5ce] dark:border-[#4a452a] hover:border-primary transition-all hover:shadow-xl shadow-primary/5">
              <div className="size-14 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] font-bold">
                  bolt
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Giao dịch chớp nhoáng</h3>
              <p className="text-[#6b6645] dark:text-[#a8a48d] leading-relaxed">
                Độ trễ thấp nhất thị trường. Xử lý hàng nghìn giao dịch mỗi giây mà
                không làm gián đoạn trải nghiệm khách hàng.
              </p>
            </div>
            <div className="group bg-white dark:bg-[#2d2a15] p-10 rounded-xl border border-[#e9e5ce] dark:border-[#4a452a] hover:border-primary transition-all hover:shadow-xl shadow-primary/5">
              <div className="size-14 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] font-bold">
                  shield
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ổn định 99.9%</h3>
              <p className="text-[#6b6645] dark:text-[#a8a48d] leading-relaxed">
                Hệ thống bảo mật đa tầng, đạt chuẩn quốc tế. Đảm bảo dịch vụ của bạn luôn
                sẵn sàng 24/7 trong mọi điều kiện.
              </p>
            </div>
            <div className="group bg-white dark:bg-[#2d2a15] p-10 rounded-xl border border-[#e9e5ce] dark:border-[#4a452a] hover:border-primary transition-all hover:shadow-xl shadow-primary/5">
              <div className="size-14 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] font-bold">
                  mood
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Giao diện thân thiện</h3>
              <p className="text-[#6b6645] dark:text-[#a8a48d] leading-relaxed">
                Loại bỏ sự nhàm chán của ngân hàng truyền thống. Trải nghiệm UI hiện
                đại, mượt mà và đầy cảm hứng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Sync Feature (landing1) */}
      <section className="py-24 px-6 relative">
        <div className="max-w-[1300px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative bg-white dark:bg-[#2d2a15] rounded-xl border border-[#e9e5ce] dark:border-[#4a452a] p-8 overflow-hidden">
              <div className="flex items-center justify-center h-[300px] relative">
                <div className="size-20 bg-primary rounded-full flex items-center justify-center z-10 shadow-2xl shadow-primary/40">
                  <span className="material-symbols-outlined text-white text-[40px] font-bold">
                    sync
                  </span>
                </div>
                <div className="absolute size-40 border border-primary/30 rounded-full" />
                <div className="absolute size-60 border border-primary/20 rounded-full" />
                <div className="absolute top-4 left-10 size-12 bg-white dark:bg-[#3a3620] rounded-full border border-[#e9e5ce] flex items-center justify-center font-bold text-xs">
                  VCB
                </div>
                <div className="absolute bottom-4 left-10 size-12 bg-white dark:bg-[#3a3620] rounded-full border border-[#e9e5ce] flex items-center justify-center font-bold text-xs">
                  TCB
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 size-12 bg-white dark:bg-[#3a3620] rounded-full border border-[#e9e5ce] flex items-center justify-center font-bold text-xs">
                  MB
                </div>
                <div className="absolute top-4 right-10 size-12 bg-white dark:bg-[#3a3620] rounded-full border border-[#e9e5ce] flex items-center justify-center font-bold text-xs">
                  BIDV
                </div>
                <div className="absolute bottom-4 right-10 size-12 bg-white dark:bg-[#3a3620] rounded-full border border-[#e9e5ce] flex items-center justify-center font-bold text-xs">
                  ACB
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex flex-col gap-8">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Kết nối mọi ngân hàng chỉ với một chạm
            </h2>
            <p className="text-lg text-[#6b6645] dark:text-[#a8a48d]">
              Đồng bộ hóa dữ liệu giao dịch từ Vietcombank, Techcombank, MB Bank và 20+
              ngân hàng nội địa khác ngay lập tức. Hero Bank Sync giúp bạn quản lý dòng
              tiền tập trung mà không cần chuyển đổi giữa các ứng dụng.
            </p>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                Tự động hóa đối soát giao dịch
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                Thông báo biến động số dư qua Webhook
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                Tích hợp dễ dàng vào ứng dụng di động
              </li>
            </ul>
            <div>
              <button className="h-12 px-6 rounded-full bg-primary/20 text-[#1c1a0d] dark:text-white font-bold hover:bg-primary transition-colors flex items-center gap-2">
                Tìm hiểu về Bank Sync
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Stories / Testimonials (landing2) */}
      <section
        id="developers"
        className="w-full max-w-[1300px] mx-auto py-20 px-4 md:px-10"
      >
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Hero Stories
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl">
            Join thousands of high-growth companies that use Hero to power their financial
            infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Three static cards preserved from landing2 */}
          {/* Card 1 */}
          <div className="flex flex-col gap-6 bg-white dark:bg-[#2d2a1a] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined">
                  star
                </span>
              ))}
            </div>
            <p className="text-lg leading-relaxed font-medium italic">
              &quot;Hero transformed our financial workflow overnight. The speed is
              unmatched, and the API is a dream to work with.&quot;
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                data-alt="Portrait of Alex Rivers, smiling professionally"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsLl-Q57r7XByObIyqE2ObpyOxryJXQmbgK9urgIJAE42auT7BIplchiCJPrs3oBG0mCcTEi4P_sEbcDtbEZyqT0jaZpgP4Ze48gqq05DfQ_Th_weGFnb61dwznzhrO2HJCjYLMw1vizvCBbENisGxo0Nq6SuVM42BXl_0xmp_jVAXj_-5evmMtmxKXVSOdJOXNNYFeW3e6zy9NzTbS3SwL3Ub_ldL4TlY1wqf4MxiQ3xlAwjALRLcmisfxSe2upZwHWCeqG14xNI_")',
                }}
              />
              <div>
                <p className="font-bold">Alex Rivers</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  CTO, Streamline Global
                </p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col gap-6 bg-white dark:bg-[#2d2a1a] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined">
                  star
                </span>
              ))}
            </div>
            <p className="text-lg leading-relaxed font-medium italic">
              &quot;Integrating with our existing stack took minutes. High energy and high
              impact. The best SaaS tool we&apos;ve used this year.&quot;
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                data-alt="Portrait of Sam Nguyen, creative professional"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACZWP09g5F1if3JXsN-YqMZttaiW3x2xPtgBoUJN6zGpG0ej_kCIsATEUpr8uOctyxYMa1eux8iPnoYIaLj6uKVE14oTKq9HTceKnmChTEgvSx_zdczJWbiVpvprKAW6eti5v0t1CJoHgc6boUDiUfBjQaWnyx3hlK1iPERFf0dMwkmxyJNIiJSLkL-pC4JQNvyM80RJAhPGd4yzO-yKwXrNgtjbNkA_EkDl_UQwfjzebd1nSXJ5tVtj00lr5KOTM5DdgcL_Gs4KeI")',
                }}
              />
              <div>
                <p className="font-bold">Sam Nguyen</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Founder, NexaPay
                </p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col gap-6 bg-white dark:bg-[#2d2a1a] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined">
                  star
                </span>
              ))}
            </div>
            <p className="text-lg leading-relaxed font-medium italic">
              &quot;The Pro Hero plan is a game changer for scaling teams. Our
              reconciliation time dropped by 80% in the first month.&quot;
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                data-alt="Portrait of Jordan Lee, operations manager"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxFZPIP0gkoElgRZfu1ONOpLUtvA88heNokSIktWaVC4LaUPgoEBS822irrLBTeQkzDlGx0L1F6RfP1YKy9lGf_F2sbj6QPEVYEdpLbmHZQzYAdjR0MVXyaJarK582TDIqOcfZOo7ZOvKJypocGzhIF8agYZ-iz45U6xa1DUcfx8ZWT-NMGgmG2p2GmW5kJ_ifsX6gFgvcgF9zlswsQ_UWWUkiNyOu_eh-DsmtkNkM44dgxTSUC548LgzlqoOsrW_9Zz3Pxkj7Ds--")',
                }}
              />
              <div>
                <p className="font-bold">Jordan Lee</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Head of Ops, VentureFlow
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations (landing2) */}
      <section className="w-full bg-white dark:bg-[#1e1c0d] py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Seamless Integrations
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
              Hero connects with the tools you already love and the banks you trust.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { icon: 'forum', label: 'Slack' },
              { icon: 'send', label: 'Telegram' },
              { icon: 'mail', label: 'Gmail' },
              { icon: 'account_balance', label: 'Chase' },
              { icon: 'payments', label: 'HSBC' },
              { icon: 'terminal', label: 'Stripe' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-all group"
              >
                <span className="material-symbols-outlined text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <span className="font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (landing2) */}
      <section
        id="pricing"
        className="w-full max-w-[1300px] mx-auto py-24 px-4 md:px-10"
      >
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Choose Your Power
          </h2>
          <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-full mt-4">
            <button className="px-6 py-2 rounded-full text-sm font-bold bg-white dark:bg-[#2d2a1a] shadow-sm">
              Monthly
            </button>
            <button className="px-6 py-2 rounded-full text-sm font-bold text-gray-500">
              Yearly (Save 20%)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter */}
          <div className="bg-white dark:bg-[#2d2a1a] p-10 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              For solo founders and enthusiasts.
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
                <span>Up to 100 transactions</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
                <span>3 Bank integrations</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 line-through">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Priority support</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-full border border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Start for Free
            </button>
          </div>

          {/* Pro Hero */}
          <div className="relative bg-white dark:bg-[#2d2a1a] p-10 rounded-xl border-4 border-primary flex flex-col h-full scale-105 z-10 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Pro Hero</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              For growing teams and startups.
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold">$29</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <ul className="flex flex-col gap-4 mb-10 flex-grow font-medium">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">
                  check_circle
                </span>
                <span>Unlimited transactions</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">
                  check_circle
                </span>
                <span>Unlimited integrations</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">
                  check_circle
                </span>
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">
                  check_circle
                </span>
                <span>Custom webhooks</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-full bg-primary text-black font-extrabold hover:brightness-105 transition-all shadow-lg">
              Go Pro Hero
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white dark:bg-[#2d2a1a] p-10 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              For global corporations.
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold">Custom</span>
            </div>
            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
                <span>Custom SLA &amp; Security</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
                <span>On-premise options</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-full border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ (landing2) */}
      <section className="w-full bg-[#fcfbf8] dark:bg-[#221f10] py-24 px-4 md:px-10 border-y border-primary/10">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-[#2d2a1a] rounded-xl p-6 border border-gray-100 dark:border-gray-800 cursor-pointer group">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">How secure is Hero Fintech?</h4>
                <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-45">
                  add
                </span>
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 hidden group-hover:block transition-all">
                We use bank-grade AES-256 encryption and are SOC2 Type II compliant. Your
                data security is our top priority.
              </div>
            </div>
            <div className="bg-white dark:bg-[#2d2a1a] rounded-xl p-6 border border-gray-100 dark:border-gray-800 cursor-pointer group">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">
                  Can I migrate from legacy platforms?
                </h4>
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2d2a1a] rounded-xl p-6 border border-gray-100 dark:border-gray-800 cursor-pointer group">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">
                  Do you offer 24/7 technical support?
                </h4>
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2d2a1a] rounded-xl p-6 border border-gray-100 dark:border-gray-800 cursor-pointer group">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">
                  What are the API rate limits for Pro?
                </h4>
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Culture (landing2) */}
      <section className="w-full max-w-[1300px] mx-auto py-24 px-4 md:px-10">
        <div className="bg-primary/10 dark:bg-primary/5 rounded-xl p-10 md:p-20 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="flex-1 z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Học hỏi và phát triển cùng cộng đồng
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-lg">
              Learn and grow with our vibrant community of over 50,000 developers and
              financial experts.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-black font-extrabold px-8 py-4 rounded-full hover:brightness-105 transition-all">
                Join Discord
              </button>
              <button className="bg-white dark:bg-[#2d2a1a] text-black dark:text-white font-bold px-8 py-4 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all">
                View Our Culture
              </button>
            </div>
          </div>
          <div className="flex-1 flex gap-4 relative">
            <div className="flex flex-col gap-4 mt-12">
              <div
                className="w-32 md:w-48 h-48 md:h-64 rounded-xl bg-center bg-cover"
                data-alt="Team members collaborating in a modern office"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOS2WreKRH2bVRaHGsF8ww1l2IztE7yYamatIH0oh6pWjHvPJTMG24eWg3Pq8_XmXLjkr_jZa6nlFtzMtRFQYNwTaDIsIL-V1LYmV0nebQeoWI79xo3OMOxf2_BgrbFGeferFjwUgAcC0ghqM69VRiX5oBhLMKm4Dzey2cuUtWMwV3kkmFBetQmRsRJM8mHGlnr5cL0DXRCSju6ryC0N1R9zfvXkB8bAw4GzeadxbGmXQ7e8NIqw2hVbvINYrijanGxXxScY2tDdtg')",
                }}
              />
              <div
                className="w-32 md:w-48 h-32 md:h-48 rounded-xl bg-center bg-cover"
                data-alt="Hero Fintech company team retreat"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3wK_qupZUZVxgBJYhIIcfMK6e4EluSkAkiygT41PCS_XcjTaYDqQ4dhHxQrQ0deARMm8NAcHxd6fc0Eg5cPcqo2Z9B1g8PBXSweX72L5IO3THTnd-0EViXPjsptQxF4LGsqvjx-x5Tz2UnRQ9_PVn_xGf8rYCs0u1E9X4iqI0rZv2uNcsK2xN5qz3H7Kw_LurLG_G6e5PiQvO9-cnazjIDoIED71K3W3AlkYd7csX2gWHHBGCSaBiinvAL53ewvOypTJYL-6CS5cu')",
                }}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div
                className="w-32 md:w-48 h-32 md:h-48 rounded-xl bg-center bg-cover"
                data-alt="Developer coding on Hero Fintech platform"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARbcBbKAjcnuXVWFXl0SE6vflHpM3vKgYcRzsuLBeCfzMnnRz1ZyeqDz85KgetjGCko-fXn5owB1foAAJekyC3jb4vjUKnvsQj_FHSU593A02T5wVGJyxx4xxVe2W22lOptnxrO6QzQJFhDQuKNa_2oOk6U0-B6TZQJPXZPYX05QUgwPgDwbPvwyssaPvBrViJto0KmbscriIriQZ2wQfvVPzmGfcEt5xgxLj_JU4UJ-FuRMl5aqlgzR8JAi0qMhHzuOl1Zn-xT6IL')",
                }}
              />
              <div
                className="w-32 md:w-48 h-48 md:h-64 rounded-xl bg-center bg-cover"
                data-alt="Team celebrating a milestone together"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCstabPzgTOjdKvukMkSmnFHPRRvoRj3iedl9ymE9zcATYNZHFU_E3DaRphqDEhdSB7KqvMK-iyNWg-Ej_obYixMdFbaZXZAxAqJfYmy63NvqsEcd2fDeph9-IIX3Qwcq2uKL9wPj56M_YPrz3rvhNypjq216vGs1kM3BVRHjE7efLTsobl-_oxMPT2yAxSra3pnPdFl39XYIOGZa8rTb2b3sAhtIUGFEbFJJsR4BYJ2ROqAzQ0_7ojHz9MY8xWCw9az2snoEmdwCjh')",
                }}
              />
            </div>
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Final CTA (landing1) */}
      <section className="py-24 px-6">
        <div className="max-w-[1300px] mx-auto bg-[#1c1a0d] dark:bg-black rounded-xl p-12 md:p-20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary/10 to-transparent" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-[800px]">
              Sẵn sàng xây dựng tương lai tài chính cùng Hero?
            </h2>
            <p className="text-lg text-white/70 max-w-[600px]">
              Bắt đầu tích hợp ngay hôm nay. Chỉ mất 5 phút để có tài khoản Sandbox và
              bắt đầu gọi API đầu tiên của bạn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="h-14 px-10 rounded-full bg-primary text-[#1c1a0d] text-base font-bold hover:scale-105 transition-transform">
                Tạo tài khoản ngay
              </button>
              <button className="h-14 px-10 rounded-full border border-white/20 text-white text-base font-bold hover:bg-white/10 transition-colors">
                Liên hệ bộ phận kinh doanh
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default LandingPage

