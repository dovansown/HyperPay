import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

type NavItem = {
  label: string
  href: string
}

type SuiteItem = {
  icon: string
  title: string
  descriptionKey: string
}

type StatItem = {
  value: string
  labelKey: string
}

type FeatureItem = {
  icon: string
  titleKey: string
  descriptionKey: string
}

type BlogPost = {
  category: string
  titleKey: string
  excerptKey: string
  imageSrc: string
}

const topNavItems: NavItem[] = [
  { label: 'nav.solutions', href: '#' },
  { label: 'nav.developers', href: '#' },
  { label: 'nav.pricing', href: '#' },
]

const trustLogos: { alt: string; src: string }[] = [
  {
    alt: 'Instacart',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrzqv1YPeiPIH0H_84S75AjZyDvbOdQrKIZinqPPHl8RCfkFf_MzKTQwnSEwXFHKzO3zPd0TqDPqNlXQohl8pwxlpl3y-xe-8YfnlcACvCu1ju6AqWW6jFt_R1fMg2IvhJLk1ihuMrk13WFFHsWyAH4pUgEQ1HmSMO4y1CGvmCSHfsdArlPq83t11TYUoJ6LdwGuCeyqcsaYDwFHqtC207HFkFMKRJFkP0pXPxMSO9ZioyCTpulbO--Ym9qScsxPZWql6oVcCNg4o',
  },
  {
    alt: 'Shopify',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQNrBRrDBD4me5SE7Z0K8SYGVzQ849m7qcSTTNxelRZnz7HX37hOFkDMKR5dmJM3cMTNrK4HMy_McDfatzQk7WNE5gQe1whAzXsj2pKGY1nnCtxgaWk5p17GaQTZlIOQglzvnpXD9pMkg-Dnig_1ksPrXQHiELfQzIRIEk_r_0wtcnRx6xoeR07vx5-wyp_F027BGm0GeKlm4-awVlTsQy5zzBVtkm80t5DXH4WL38IaGtjZQQgRSPsYZDzIfhDK0jswjJk1Lg_yc',
  },
  {
    alt: 'Amazon',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV8ihdaxuiUs3QsHl0VH1CjJmEkiOY6wiGY0klrIq6s806FaQjTKW_VKRRlzYRRwZKuI6g8hJ-l3MQP2Azs1zCIRHj2jifZlzxnd1j19azIipfH6Vid27jaQOCRBHw99A_bWL0GC24PAKDA0vQ8mv5Wwp1FNjj7MnxRBDTMrDuSLNpNUPozcz_HuLoqiN5RGTRibq8sX4kOQVaSibAmvCfcD5Lb11hnCE4WHU_orJ9YnO7v2gwPSYuOTbGyHGQL2d1YzNA1NKTVis',
  },
  {
    alt: 'Google',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGcNbH53elWXEuSIEntDnlVrZLcvFr0R6BwB-VTTxzE25FzQHyHYV6ePfm3CMtAHbTnTBcBIq7ZSvsB9am0kofXviKUAEk6a6WwoYCboLttoU6zL2mF2IQnQIv7BK1CYuVIrKakYvIvbnmJH6xy0stAS8QICk1cpD9Nwtttesqn3PLsXYtRGQdaDlTj4HQ3ANmJm8LfDPaIVgE29lS5359uiz6LPMZmL7Im6vk3X3zHs7XazK6EZSE9fAaI3MZuqYmy9-yj6_qADs',
  },
  {
    alt: 'Salesforce',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf0CV-T06BQ5Mmy7zO6Hv8VgDMLO0Pgms3oUGjMJdBEMQ7lUs8jUigG8s25p5S-0ZHPebVGI0qUt93UBvyL7vFnWxIrlohhXjbSREMYENg0DcAtOpzPOhOIq8mIkdxlSuqr8Etyu8DNkBI_ggFo58Z11_RXThYerzl7vySw8sWbNqNE6rFqCy9kazew07L8sguoaS2qngjhwNNSnNW4Tug7UhLLxEaw6Megf85LTORTr9HE8lG6xOm5Pj2tv2OSg-XoZlDYDVW3cI',
  },
  {
    alt: 'Slack',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3jCqSf1c0gx4agRf861-1onabcU8bPg6GM41Wi8lJf_hqVdVOs4bjwyHbrSUBzxWNDnsGR24-yBSUDM72jmUGIaPpzxqI8cddrP2zvLa5E-6MKVCcMoSJBH3AEqlZyg6Z98PpsuiElhNTjKBfX1sryDZEY2i5aNbltW-_pQqQh4hvWIGq3Y8CCLf2O4-5OqQnir7cxs1FSkOkdXIVg6T7AlArlGsHyBlutst0Q62j0bSL6SXtrAB_DB1bUKlbihKkw_3Cjh9c9Mk',
  },
]

const suite: SuiteItem[] = [
  {
    icon: 'credit_card',
    title: 'Payments',
    descriptionKey: 'landing.suite.payments',
  },
  {
    icon: 'sync_alt',
    title: 'Subscriptions',
    descriptionKey: 'landing.suite.subscriptions',
  },
  {
    icon: 'account_balance',
    title: 'Banking',
    descriptionKey: 'landing.suite.banking',
  },
] as const satisfies Array<SuiteItem & { descriptionKey: `landing.suite.${string}` }>

const globalStats: StatItem[] = [
  { value: '135+', labelKey: 'landing.globalStats.c1' },
  { value: '45+', labelKey: 'landing.globalStats.c2' },
  { value: '99.9%', labelKey: 'landing.globalStats.c3' },
  { value: '250M+', labelKey: 'landing.globalStats.c4' },
] as const

const featureList: FeatureItem[] = [
  {
    icon: 'analytics',
    titleKey: 'landing.features.reporting.title',
    descriptionKey: 'landing.features.reporting.description',
  },
  {
    icon: 'account_balance_wallet',
    titleKey: 'landing.features.payouts.title',
    descriptionKey: 'landing.features.payouts.description',
  },
  {
    icon: 'gpp_maybe',
    titleKey: 'landing.features.fraud.title',
    descriptionKey: 'landing.features.fraud.description',
  },
  {
    icon: 'api',
    titleKey: 'landing.features.api.title',
    descriptionKey: 'landing.features.api.description',
  },
] as const

const blogPosts: BlogPost[] = [
  {
    category: 'landing.blog.engineering.category',
    titleKey: 'landing.blog.engineering.title',
    excerptKey: 'landing.blog.engineering.excerpt',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBD7Z9Kp_joB-HsAPO_tOryYgXjqYgTvWwrTTbn8ZxDCeIqKKPeDON5jVx2a-3KTwaT_z5iV47hV8c7_Il01PTW3hPv099cSwOTv2rwGRK9XHbVeG2RgHTFifmte3TGyDWdRm-sx_E-yR6U3JSlKk4tqwv6aAsAWIiMpflm25AmDm520PH4xnm42SsjaLtK8nqgNQQCMDd082V34o8zLwc7cLhBvP-CJkQxEfjaWRSRiFwCJFFACs9q5FOWlYrIeKSCcyY0AdqrZ_4',
  },
  {
    category: 'landing.blog.product.category',
    titleKey: 'landing.blog.product.title',
    excerptKey: 'landing.blog.product.excerpt',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn9FyPXpJtL67xlmvNbNgWstGIR4AdDcrACgTikMcvhOdPe87i4fqTDezkTWMmAi_DTgoo9skz0ZXVU9LhidCOfW1cPTqOZeDSN8rEApdKm7sB8BeiT98bPjozni_lS-QqzDswIdGjgVjGguFnmt4Q7H_u-mS8IBl_NwNcJYfxSTZ8BIr6H8GR6nHE78iS_fhnpI2xu7-ZnMCIJVloQzlo7sfvnyEovCxVECWMRxDQpuz7W2w2rAEwgheSvtB__bseOXEkkl28xRE',
  },
  {
    category: 'landing.blog.strategy.category',
    titleKey: 'landing.blog.strategy.title',
    excerptKey: 'landing.blog.strategy.excerpt',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Kg3ivts7sssfo0yqv1yaXYY5yrlvPTbsVig8CW83b2T09BTK1RzrUBy1UyPTfav54aogTPvY-isTYdh66FI_jSmBKWgzsn4fHIp1AC5D4aIGrvtmn77UjClj32tF869pvXul9yD_nnu1qjVWG6f0wN1HvMlwZhNOKnKfMpRdOfGIKKG5gBbAw8-So2QGqdGZmAewiDWSEWM1y63_wufofu8DTSSwhAtm7P63559pIfgChxnILdpqqtCawnMGLSYg4rct8VAXbvY',
  },
]

const footerCols: { title: string; links: NavItem[] }[] = [
  {
    title: 'footer.products',
    links: [
      { label: 'footer.products.payments', href: '#' },
      { label: 'footer.products.billing', href: '#' },
      { label: 'footer.products.connect', href: '#' },
      { label: 'footer.products.terminal', href: '#' },
      { label: 'footer.products.issuing', href: '#' },
    ],
  },
  {
    title: 'footer.solutions',
    links: [
      { label: 'footer.solutions.ecommerce', href: '#' },
      { label: 'footer.solutions.saas', href: '#' },
      { label: 'footer.solutions.marketplaces', href: '#' },
      { label: 'footer.solutions.embeddedFinance', href: '#' },
      { label: 'footer.solutions.crypto', href: '#' },
    ],
  },
  {
    title: 'footer.resources',
    links: [
      { label: 'footer.resources.docs', href: '#' },
      { label: 'footer.resources.api', href: '#' },
      { label: 'footer.resources.guides', href: '#' },
      { label: 'footer.resources.caseStudies', href: '#' },
      { label: 'footer.resources.support', href: '#' },
    ],
  },
  {
    title: 'footer.company',
    links: [
      { label: 'footer.company.about', href: '#' },
      { label: 'footer.company.careers', href: '#' },
      { label: 'footer.company.newsroom', href: '#' },
      { label: 'footer.company.security', href: '#' },
      { label: 'footer.company.privacy', href: '#' },
    ],
  },
]

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.token))

  const currentLanguage = i18n.language.startsWith('vi') ? 'vi' : 'en'

  const handleChangeLanguage = (lng: 'vi' | 'en') => {
    void i18n.changeLanguage(lng)
  }

  return (
    <div className="min-h-dvh">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">bolt</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">HyperPay</span>
            </div>

            <div className="hidden lg:flex items-center gap-7">
              <div className="group relative py-4 cursor-pointer">
                <span className="text-sm font-medium text-slate-custom flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                  {t('nav.products')}{' '}
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </span>
                <div className="absolute top-full left-0 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-100 p-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      {
                        icon: 'payments',
                        titleKey: 'landing.products.payments.title',
                        descKey: 'landing.products.payments.desc',
                      },
                      {
                        icon: 'sync',
                        titleKey: 'landing.products.billing.title',
                        descKey: 'landing.products.billing.desc',
                      },
                      {
                        icon: 'account_balance',
                        titleKey: 'landing.products.treasury.title',
                        descKey: 'landing.products.treasury.desc',
                      },
                      {
                        icon: 'security',
                        titleKey: 'landing.products.radar.title',
                        descKey: 'landing.products.radar.desc',
                      },
                    ].map((item) => (
                      <div
                        key={item.titleKey}
                        className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t(item.titleKey)}</p>
                          <p className="text-xs text-slate-custom mt-1">{t(item.descKey)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {topNavItems.map((item) => (
                <a
                  key={item.label}
                  className="text-sm font-medium text-slate-custom hover:text-slate-900 transition-colors"
                  href={item.href}
                >
                  {t(item.label)}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleChangeLanguage('en')}
                className={`px-2 py-1 rounded-full transition-colors ${
                  currentLanguage === 'en'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleChangeLanguage('vi')}
                className={`px-2 py-1 rounded-full transition-colors ${
                  currentLanguage === 'vi'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                VI
              </button>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 min-w-[160px] text-center"
              >
                {t('common.dashboard')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-slate-custom hover:text-slate-900 min-w-[96px] text-center"
                >
                  {t('common.signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 min-w-[112px] text-center"
                >
                  {t('common.startNow')}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 overflow-hidden hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
                {t('landing.heroBadge')}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {t('landing.heroTitle')}
              </h1>
              <p className="text-lg md:text-xl text-slate-custom leading-relaxed max-w-lg">
                {t('landing.heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="bg-primary text-white px-8 py-4 rounded-full font-medium text-base md:text-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/30 min-w-[160px] justify-center"
                  type="button"
                  onClick={() => navigate('/register')}
                >
                  {t('landing.heroPrimaryCta')}{' '}
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                  className="bg-white/50 backdrop-blur-sm text-slate-900 px-8 py-4 rounded-full font-medium text-base md:text-lg hover:bg-white transition-all border border-slate-200 min-w-[160px] justify-center"
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  {t('landing.heroSecondaryCta')}
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl transform rotate-3 scale-105 border border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4 font-mono text-sm text-blue-300">
                  <p>
                    <span className="text-purple-400">const</span> hyperpay ={' '}
                    <span className="text-yellow-300">require</span>(
                    <span className="text-green-400">'@hyperpay/api'</span>);
                  </p>
                  <p>
                    <span className="text-purple-400">await</span> hyperpay.paymentIntents.create(
                    {'{'}
                  </p>
                  <p className="pl-4">
                    amount: <span className="text-orange-400">2000</span>,
                  </p>
                  <p className="pl-4">
                    currency: <span className="text-green-400">'usd'</span>,
                  </p>
                  <p className="pl-4">
                    payment_method_types: [<span className="text-green-400">'card'</span>],
                  </p>
                  <p>{'});'}</p>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 w-64">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <span className="font-medium">Payment success</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full mb-2 overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full" />
                </div>
                <p className="text-xs text-slate-custom">$2,450.00 USD processed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {trustLogos.map((l) => (
              <img key={l.alt} alt={l.alt} src={l.src} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
            {t('landing.suiteLabel')}
          </h2>
          <h3 className="text-4xl font-black text-slate-900">
            {t('landing.suiteTitle')}
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {suite.map((item) => (
            <div
              key={item.title}
              className="group p-8 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="size-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h4 className="text-xl font-medium mb-3">{item.title}</h4>
              <p className="text-slate-custom leading-relaxed">
                {t(item.descriptionKey)}
              </p>
              <a
                className="inline-flex items-center gap-1 text-primary font-medium mt-6 text-sm"
                href="#"
              >
                {t('landing.learnMore', 'Learn more')}{' '}
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
              <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-10 bg-slate-700/50 flex items-center px-4 gap-2">
                  <div className="size-2 rounded-full bg-slate-600" />
                  <div className="size-2 rounded-full bg-slate-600" />
                  <div className="size-2 rounded-full bg-slate-600" />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-1">
                        Gross Volume
                      </p>
                      <h5 className="text-3xl font-black">$241,560.80</h5>
                    </div>
                    <div className="text-green-400 font-medium text-sm">+24.5%</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 items-end h-32 mb-8">
                    {['h-12', 'h-20', 'h-16', 'h-28', 'h-24', 'h-32', 'h-28'].map((h, idx) => (
                      <div
                        key={idx}
                        className={`bg-primary/${40 + idx * 10} rounded-t ${h}`}
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Net earnings', value: '$189,200.00' },
                      { label: 'Total fees', value: '$2,360.80' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-black leading-tight">Your unified business command center</h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Track your performance across every channel and region. HyperPay Dashboard gives you
                real-time visibility into your financial ecosystem, all in one place.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time transaction monitoring',
                  'Advanced filtering and custom reports',
                  'Multi-user access with granular permissions',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">done</span>
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
            {t('landing.globalReachLabel')}
          </h2>
          <h3 className="text-4xl font-black text-slate-900 mb-8">
            {t('landing.globalReachTitle')}
          </h3>
          <p className="text-xl text-slate-custom max-w-2xl mx-auto mb-16 leading-relaxed">
            {t('landing.globalReachDescription')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {globalStats.map((s) => (
              <div key={s.labelKey} className="p-6">
                <p className="text-5xl font-black text-slate-900 mb-2">{s.value}</p>
                <p className="text-slate-custom font-medium uppercase text-xs tracking-widest">
                  {t(s.labelKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl relative aspect-video md:aspect-[21/9] bg-slate-100 flex items-center justify-center">
            <img
              alt="Map"
              className="w-full h-full object-cover opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCURUHaWAf2gqw27on_r3sIQ7y3lZ1-_xIkHeV7mb7SAJVoznYckgp0nxvy9yyJifFFwhFYYsONt5kZ7wvKE8IxKEnweFBUTbskt3nSJeCOpbWGtWlOKs10pBljZO-Q0N9ePfUS36NMTHQGPNcsmbAfggZfZg2E6nv7FMpHVLpYvjSkViCzYjKr7dqYanirUHzWnlgNjRBdciyT6VqS8Poowr2nutMxxd9p3H_BqXRAanOtuvYS8OCS0zYLqOb7w-OUbmPlAxc2FjM"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
                public
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
                {t('landing.developersLabel')}
              </h2>
              <h3 className="text-4xl font-black text-white mb-6">{t('landing.developersTitle')}</h3>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                {t('landing.developersDescription')}
              </p>
              <div className="flex gap-4">
                <button className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
                  {t('landing.developersCtaDocs', 'Read the docs')}{' '}
                  <span className="material-symbols-outlined">menu_book</span>
                </button>
                <button className="text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-all border border-white/20">
                  {t('landing.developersCtaApi', 'Explore API Reference')}
                </button>
              </div>
            </div>

            <div className="bg-[#011627] rounded-xl overflow-hidden shadow-2xl border border-white/5">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0b2540] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="size-2.5 rounded-full bg-red-500/80" />
                  <div className="size-2.5 rounded-full bg-yellow-500/80" />
                  <div className="size-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 font-mono">bash</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                <p className="text-slate-500"># Install the HyperPay CLI</p>
                <p className="text-green-400">curl -s https://hyperpay.sh/install.sh | sh</p>
                <p className="mt-4 text-slate-500"># Authenticate your terminal</p>
                <p className="text-green-400">hyperpay login</p>
                <p className="mt-4 text-slate-500"># Listen for webhook events</p>
                <p className="text-green-400">
                  hyperpay listen --forward-to localhost:4242/webhook
                </p>
                <p className="mt-4 text-slate-500"># Response:</p>
                <p className="text-blue-400">&gt; Ready! Your webhook signing secret is whsec_...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6">
        <h3 className="text-4xl font-black text-slate-900 text-center mb-16">
          {t('landing.businessTitle')}
        </h3>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: 'shopping_cart',
              color: 'bg-blue-100 text-blue-600',
              titleKey: 'landing.businessCards.ecommerce.title',
              descKey: 'landing.businessCards.ecommerce.description',
            },
            {
              icon: 'token',
              color: 'bg-indigo-100 text-indigo-600',
              titleKey: 'landing.businessCards.saas.title',
              descKey: 'landing.businessCards.saas.description',
            },
            {
              icon: 'hub',
              color: 'bg-purple-100 text-purple-600',
              titleKey: 'landing.businessCards.platforms.title',
              descKey: 'landing.businessCards.platforms.description',
            },
            {
              icon: 'storefront',
              color: 'bg-pink-100 text-pink-600',
              titleKey: 'landing.businessCards.marketplaces.title',
              descKey: 'landing.businessCards.marketplaces.description',
            },
          ].map((c) => (
            <div
              key={c.titleKey}
              className="text-center p-6 border border-slate-100 rounded-2xl hover:shadow-xl transition-all bg-white"
            >
              <div
                className={`size-16 ${c.color} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <span className="material-symbols-outlined text-3xl">{c.icon}</span>
              </div>
              <h4 className="text-xl font-medium mb-3">{t(c.titleKey)}</h4>
              <p className="text-slate-custom text-sm">{t(c.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] p-12 md:p-20 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
                {t('landing.securityLabel')}
              </h2>
              <h3 className="text-4xl font-black text-slate-900 mb-6">
                {t('landing.securityTitle')}
              </h3>
              <p className="text-xl text-slate-custom mb-8 leading-relaxed">
                {t('landing.securityDescription')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'verified', key: 'landing.securityBadges.pci' },
                  { icon: 'lock', key: 'landing.securityBadges.encryption' },
                  { icon: 'shield', key: 'landing.securityBadges.fraud' },
                  { icon: 'key', key: 'landing.securityBadges.twofa' },
                ].map((i) => (
                  <div key={i.key} className="flex items-center gap-2 text-slate-900 font-medium">
                    <span className="material-symbols-outlined text-green-500">{i.icon}</span>
                    {t(i.key)}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <span className="material-symbols-outlined text-[150px] text-primary relative z-10">
                  verified_user
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="lg:w-1/2 relative h-[400px] lg:h-auto">
            <img
              alt="Customer"
              className="absolute inset-0 w-full h-full object-cover grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbHQjTz44oa_K-OIoCSWUNpzZJsJXgi9L47OW9Hx64J4_g1uVJ8W4nAjpB9BX-UIKdX6S6W6IJHzuIQMcsWmu9eWQ8B3C9iK6-GU7fAoVBX0eiP741b7SVyFlrGL9YzdFGsrHaQZWb0A314E_HgikoXcTPFJn7SUf9tPXFAdlnOI-mrOkpZcUexQ52DZDwm_mp3trnmalcxTvolvYXuLKqg4sOCpGh4dImJVQ0eVDOS4Btg3K1_Uin86d9Qi7qOfKfapSvucqxqG0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
          <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
            <span className="material-symbols-outlined text-primary text-6xl mb-8">
              format_quote
            </span>
            <p className="text-2xl md:text-3xl font-medium text-white mb-8 leading-snug italic">
              {t('landing.testimonialQuote')}
            </p>
            <div>
              <h5 className="text-white font-medium text-xl">{t('landing.testimonialName')}</h5>
              <p className="text-slate-400">{t('landing.testimonialRole')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {featureList.map((f) => (
              <div key={f.titleKey} className="space-y-4">
                <span className="material-symbols-outlined text-primary">{f.icon}</span>
                <h4 className="font-medium text-lg">{t(f.titleKey)}</h4>
                <p className="text-slate-custom text-sm">{t(f.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-black mb-12">{t('landing.toolsTitle')}</h3>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBjEkx09ajobtyYKJfcZkgua___tMc2g64j9EsrhkB-K9k4NEPGKFLCCetW26mamK47V7KZzZXVBtFed47X6h16ILQjirwfJKC7nzHgmRZVS2IgomuIaxUuYV1Au-5W1cpUA8FiBrYVxO64CBvS1VOKSraUBYNdsBnimKLAMeLeX1RJisVW2eGqNe6rxA6URQCnjqVaofWUvii6SfObKhUqOCF9EIL_2_MzaLA8h5mLao8vVYcrk07cPirUQqxuqP871_heSjMuKq0',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuArQ2tJ_KmTdjx6lOJ54Stx6LHaMEY3PvaBYK09Ah0dUu_OvZJ0J0LaCQlqpDLHh_VRBn_fy90KlyIaYdGYBAlNqVYWREusjhgfH8vwBRo-PzDXfvOhdZrL1uDPLoUFmD0l_DAWbwoNlajAJt4sE60Tfpk0nSjjEAldLDaPjPM51ot2Gc1m1Vfrmlt1REUAo59JuHu9UV2NFcMXUe0dLtlwqen0R6pQ6mz7RhyjCKaDxIyGroj68dOoCIr75TFm3P8134crZHqLilo',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNZBhh9FmE6uqjLIJNmnROgDiz-6u6qDh1NR6a_IZ071Dj0hyKfimBseT1XtbSBakosJJIT9DVSLOo_9fi-mMzSMS79vhdNNjM0wyMHe87QrkxKJmIIK7Fc1uoW2pEr9aahZ3RnMeNSgF6lv_f6NJ_CjiODu1mMAAAMR82sHzXZGKBPVhqxqNgxjwKRVbD7zDskpDC8L3Q_0kS4_sEOIYFL0YK4ZuC10Jk5QHgTY4dcbxufHcVytKlkl4qFM_4bjbodn35E26k9U',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuA7PLX7hSM-1hWQedTv4O5XVteIkviwMHlFWXbvKP-5saV8Z-Os1-7BoNikMqoZeMeo1auxc7zju-PMEUjl9DC-ubmYBZWWcyUpmTD_TCjz3ClPA4i9se7-DBHoWTOQP3vGUegytPyJkUqQ5Vi2w9OBam7H-kNr3ylwzEN8MXhvmOtnqhGqcfL1BAIz39eidwrSIaNmItCkgJoHYXhGeq_cZkOnK_KTLaO9tpWgqKDF3V-98-N_jUTCW_E6oCUpU2T9W2rBrJCpZo4',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDttmLlyA0XoGPTKaBQ6quN-Q_tXluSrQmgbagWhTA9PRi7vekpPH65PUwdT0Odah0Vj4oNQeKbLAky0eMlE5OsEEwaz2GFpS3nLLy9N1kTNR6OdZuwLoi1SErRcopUbLkL8AUVJ1yrkNkWLqw7XtwkQs_ggd12UOf_NMfYKDiBrJD5lh-Ijn9TJKTPgY7H8LBYS1CqqC8crRVJIMFGblhsKbzM185_Wv8VI3EKU-PmQkKRhks1Zj7VF2bRNHAxWdR3AmJmUNO44bw',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAsXRLZwah5fHS53uFLUrawMqF_L7cuzVD8Ew8Pu3JHP24pCRm3BmHzpzFmFhNxTiuqjWLeCQhvAnBuh0q-UsOZpsVkU0NFeBlsafjaqGK8kn--IWkOFcM7Fp4UAgAsoaV0t4GkA-up5lOQleuV8GesFS8JYxAhJdsf93hJA1Y2x0H0gnhzmslG_FWeRxSScxTgYtj8b6Qa51936VsHPfTpzd_Ainn43wsllVuzfEQFEEi-SS7w0mkGwO1529XQgTcpJgNtswhvEBo',
            ].map((src, idx) => (
              <div
                key={idx}
                className="size-16 bg-white rounded-xl shadow-md flex items-center justify-center p-3"
              >
                <img alt="App" src={src} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="p-10 rounded-3xl bg-white border border-slate-100 shadow-xl flex flex-col">
            <h4 className="text-2xl font-black mb-2">{t('landing.pricingPaygTitle')}</h4>
            <p className="text-slate-custom mb-8">{t('landing.pricingPaygSubtitle')}</p>
            <div className="text-5xl font-black text-primary mb-8">
              2.9% <span className="text-lg text-slate-custom font-medium">+ 30¢</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                'landing.pricingPayg.b1',
                'landing.pricingPayg.b2',
                'landing.pricingPayg.b3',
              ].map((key) => (
                <li key={key} className="flex items-center gap-3 text-slate-custom">
                  <span className="material-symbols-outlined text-green-500 text-sm">
                    check_circle
                  </span>{' '}
                  {t(key)}
                </li>
              ))}
            </ul>
            <button className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all">
              {t('common.startNow')}
            </button>
          </div>

          <div className="p-10 rounded-3xl bg-slate-900 text-white flex flex-col">
            <h4 className="text-2xl font-black mb-2">{t('landing.pricingEnterpriseTitle')}</h4>
            <p className="text-slate-400 mb-8">{t('landing.pricingEnterpriseSubtitle')}</p>
            <div className="text-5xl font-black text-white mb-8">Custom</div>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                'landing.pricingEnterprise.b1',
                'landing.pricingEnterprise.b2',
                'landing.pricingEnterprise.b3',
              ].map((key) => (
                <li key={key} className="flex items-center gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>{' '}
                  {t(key)}
                </li>
              ))}
            </ul>
            <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-medium hover:bg-slate-100 transition-all">
              {t('common.contactSales')}
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
            {t('landing.banksLabel')}
          </h2>
          <h3 className="text-3xl font-black text-slate-900 mb-12">
            {t('landing.banksTitle')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all">
            {[
              'J.P. Morgan',
              'Goldman Sachs',
              'HSBC',
              'Barclays',
              'Citi',
              'Deutsche Bank',
            ].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    account_balance
                  </span>
                  <span className="text-xs font-medium text-slate-custom uppercase tracking-tighter">
                    {n}
                  </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-4">
                {t('landing.resourcesLabel')}
              </h2>
              <h3 className="text-4xl font-black text-slate-900">
                {t('landing.resourcesTitle')}
              </h3>
            </div>
            <a className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all" href="#">
              {t('landing.blogViewAll')}{' '}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((p) => (
              <div
                key={p.titleKey}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-video bg-slate-200 overflow-hidden">
                  <img
                    alt="Blog post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={p.imageSrc}
                  />
                </div>
                <div className="p-8">
                  <div className="text-primary text-xs font-medium uppercase tracking-widest mb-3">
                    {t(p.category)}
                  </div>
                  <h4 className="text-xl font-medium mb-3 leading-tight">
                    {t(p.titleKey)}
                  </h4>
                  <p className="text-slate-custom text-sm mb-6">{t(p.excerptKey)}</p>
                  <a className="text-slate-900 font-medium text-sm flex items-center gap-1 group/link" href="#">
                    {t('landing.blogReadMore', 'Read more')}{' '}
                    <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">
                      chevron_right
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-white/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {t('landing.ctaDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-primary px-10 py-5 rounded-full font-medium text-xl hover:shadow-2xl transition-all">
              {t('common.createAccount')}
            </button>
            <button className="bg-transparent border border-white/40 text-white px-10 py-5 rounded-full font-medium text-xl hover:bg-white/10 transition-all">
              {t('common.contactSales')}
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-24">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="size-6 bg-primary rounded flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">HyperPay</span>
              </div>
              <div className="flex gap-4 mb-8">
                {['share', 'public', 'mail'].map((i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-slate-custom hover:text-primary cursor-pointer"
                  >
                    {i}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-custom font-medium">
                <span className="material-symbols-outlined text-sm">language</span>
                United States (English)
              </div>
            </div>

            {footerCols.map((col) => (
              <div key={col.title}>
                <h6 className="font-medium text-slate-900 mb-6 uppercase text-xs tracking-widest">
                  {t(col.title)}
                </h6>
                <ul className="space-y-4 text-slate-custom text-sm font-medium">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a className="hover:text-primary transition-colors" href={l.href}>
                        {t(l.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 text-xs text-slate-400 font-medium">
            <p>{t('landing.footerCopyright')}</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a className="hover:text-slate-900" href="#">
                {t('landing.footerPrivacy')}
              </a>
              <a className="hover:text-slate-900" href="#">
                {t('landing.footerCookie')}
              </a>
              <a className="hover:text-slate-900" href="#">
                {t('landing.footerTerms')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

