import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { listPublicContent, type PublicContentItem } from '../../lib/contentApi'

export const HelpPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<PublicContentItem[]>([])
  const [articleError, setArticleError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await listPublicContent({ type: 'HELP_ARTICLE', limit: 9, offset: 0 })
        setArticles(result)
      } catch (e) {
        setArticleError(
          e instanceof Error ? e.message : t('help.cms.errorLoad', 'Failed to load help articles'),
        )
      }
    }
    void load()
  }, [])

  const topics = [
    {
      icon: 'account_circle',
      title: t('help.topics.account.title', 'Account'),
      description: t(
        'help.topics.account.description',
        'Manage your user profile, security settings, and team permissions for your organization.',
      ),
      links: [
        t('help.topics.account.link1', 'Changing your password'),
        t('help.topics.account.link2', 'Enabling 2FA security'),
        t('help.topics.account.link3', 'Adding team members'),
      ],
    },
    {
      icon: 'payments',
      title: t('help.topics.payments.title', 'Payments'),
      description: t(
        'help.topics.payments.description',
        'Understand transaction cycles, dispute resolution, and international currency settlements.',
      ),
      links: [
        t('help.topics.payments.link1', 'Transaction processing'),
        t('help.topics.payments.link2', 'Managing refunds'),
        t('help.topics.payments.link3', 'Payout schedules'),
      ],
    },
    {
      icon: 'receipt_long',
      title: t('help.topics.billing.title', 'Billing'),
      description: t(
        'help.topics.billing.description',
        'Manage your subscription plans, download invoices, and update payment methods.',
      ),
      links: [
        t('help.topics.billing.link1', 'Pricing and fees'),
        t('help.topics.billing.link2', 'Subscription management'),
        t('help.topics.billing.link3', 'Tax documentation'),
      ],
    },
  ] as const

  return (
    <PublicLayout>
      <section className="relative px-6 py-16 md:py-28 overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #645cff 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-white text-4xl md:text-6xl font-black tracking-tight mb-6">
            {t('help.hero.title', 'How can we help?')}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            {t(
              'help.hero.subtitle',
              'Search our help center for quick answers to your questions or browse popular topics below.',
            )}
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-xl p-1.5 shadow-2xl focus-within:ring-2 focus-within:ring-primary transition-all">
              <div className="pl-4 pr-2 text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </div>
              <Input
                aria-label={t('help.hero.searchAria', 'Search')}
                placeholder={t('help.hero.searchPlaceholder', 'Search for payments, API, or billing...')}
                className="border-0 focus:ring-0 bg-transparent px-0 py-4 text-lg"
              />
              <Button className="hidden sm:inline-flex" size="md">
                {t('help.hero.searchButton', 'Search')}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-slate-400 text-sm">{t('help.hero.popular', 'Popular:')}</span>
              {[
                t('help.hero.popular1', 'Reset password'),
                t('help.hero.popular2', 'API documentation'),
                t('help.hero.popular3', 'Payout schedule'),
              ].map((x) => (
                <a
                  key={x}
                  className="text-slate-300 hover:text-white text-sm underline underline-offset-4 decoration-primary/50"
                  href="#"
                >
                  {x}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t('help.topics.title', 'Common help topics')}
            </h2>
            <p className="text-slate-500">
              {t('help.topics.subtitle', 'Everything you need to manage your account and payments')}
            </p>
          </div>
          <a className="text-primary font-semibold flex items-center gap-1 hover:underline" href="#">
            {t('help.topics.viewAll', 'View all topics')}{' '}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topics.map((x) => (
            <Card key={x.title} className="p-0 rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer">
              <CardBody className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">{x.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{x.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">{x.description}</p>
                <ul className="space-y-3">
                  {x.links.map((l) => (
                    <li key={l}>
                      <a className="text-sm text-slate-500 hover:text-primary flex items-center gap-2" href="#">
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            {t('help.cms.title', 'Help articles from CMS')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardBody>
                  <h4 className="font-semibold text-slate-900 mb-2">{article.title}</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {article.excerpt ?? t('help.cms.noExcerpt', 'No excerpt available.')}
                  </p>
                  <Link className="text-primary text-sm font-semibold hover:underline" to={`/blog/${article.slug}`}>
                    {t('help.cms.openArticle', 'Open article')}
                  </Link>
                </CardBody>
              </Card>
            ))}
            {articles.length === 0 && !articleError && (
              <p className="text-sm text-slate-500">
                {t('help.cms.empty', 'No help articles found from API.')}
              </p>
            )}
          </div>
          {articleError && <p className="text-xs text-red-600 mt-3">{articleError}</p>}
        </div>
      </section>

      <section className="bg-primary/5 border-y border-slate-200 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('help.support.title', 'Still need help?')}
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              {t(
                'help.support.subtitle',
                "If you couldn't find what you were looking for, our team and community are here to support you 24/7.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <span className="material-symbols-outlined text-4xl">support_agent</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('help.support.contactTitle', 'Contact Support')}</h3>
              <p className="text-slate-600 mb-8 max-w-sm">
                {t(
                  'help.support.contactSubtitle',
                  'Chat with our experts or send us a message. We typically respond within 2 hours during business hours.',
                )}
              </p>
              <Button className="w-full" onClick={() => navigate('/help')}>
                {t('help.support.contactCta', 'Get in touch')}
              </Button>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                <span className="material-symbols-outlined text-4xl">forum</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('help.support.forumTitle', 'Community Forum')}</h3>
              <p className="text-slate-600 mb-8 max-w-sm">
                {t(
                  'help.support.forumSubtitle',
                  "Join thousands of developers and entrepreneurs. Share solutions and learn from others' experiences.",
                )}
              </p>
              <Button variant="secondary" className="w-full">
                {t('help.support.forumCta', 'Visit the community')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900 to-transparent z-10" />
            <div className="bg-slate-800/50 w-full h-full rounded-l-[100px] border-l border-slate-700 transform translate-x-20 rotate-12" />
          </div>
          <div className="relative z-20 flex-1">
            <span className="inline-block px-4 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
              {t('help.dev.badge', 'For Developers')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('help.dev.title', 'Ready to start integrating?')}
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg">
              {t(
                'help.dev.subtitle',
                'Dive into our technical documentation, explore API references, and use our SDKs to build your custom payment solution.',
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="bg-primary text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:translate-y-[-2px] transition-transform"
                onClick={() => navigate('/docs')}
              >
                {t('help.dev.docs', 'Read Docs')}{' '}
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
              <button
                type="button"
                className="bg-slate-800 text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors"
                onClick={() => navigate('/docs')}
              >
                {t('help.dev.api', 'API Reference')}
              </button>
            </div>
          </div>
          <div className="relative z-20 flex-1 w-full max-w-md">
            <div className="bg-[#0f172a] rounded-xl border border-slate-700 p-4 font-mono text-sm shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="text-slate-300">
                <p className="text-primary">curl</p>
                <p className="pl-4">https://api.hyperpay.com/v1/charges \</p>
                <p className="pl-4">-u sk_test_...: \</p>
                <p className="pl-4">-d amount=2000 \</p>
                <p className="pl-4">-d currency=usd \</p>
                <p className="pl-4">-d source=tok_visa \</p>
                <p className="pl-4">-d description="Software subscription"</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

