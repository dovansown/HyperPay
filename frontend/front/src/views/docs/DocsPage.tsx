import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PublicLayout } from '../public/PublicLayout'
import { listPublicContent, type PublicContentItem } from '../../lib/contentApi'

type DocsTab = 'getting-started' | 'api' | 'sdks' | 'resources'

export const DocsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<DocsTab>('getting-started')
  const [docPages, setDocPages] = useState<PublicContentItem[]>([])
  const [docError, setDocError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const docs = await listPublicContent({ type: 'DOC_PAGE', limit: 12, offset: 0 })
        setDocPages(docs)
      } catch (e) {
        setDocError(e instanceof Error ? e.message : t('docs.cms.errorLoad', 'Failed to load docs'))
      }
    }
    void load()
  }, [])

  const gettingStartedCards = useMemo(
    () => [
      {
        icon: 'description',
        title: t('docs.gettingStarted.cards.quickstart.title', 'Quickstart Guide'),
        description: t(
          'docs.gettingStarted.cards.quickstart.description',
          'Set up your first payment in under 10 minutes with our step-by-step tutorial.',
        ),
        cta: t('docs.gettingStarted.cards.quickstart.cta', 'Read guide'),
      },
      {
        icon: 'payments',
        title: t('docs.gettingStarted.cards.methods.title', 'Payment Methods'),
        description: t(
          'docs.gettingStarted.cards.methods.description',
          'Learn about supported payment methods including Cards, Apple Pay, and local variants.',
        ),
        cta: t('docs.gettingStarted.cards.methods.cta', 'Browse methods'),
      },
      {
        icon: 'security',
        title: t('docs.gettingStarted.cards.auth.title', 'Authentication'),
        description: t(
          'docs.gettingStarted.cards.auth.description',
          'Secure your API calls using API keys and OAuth2 authentication workflows.',
        ),
        cta: t('docs.gettingStarted.cards.auth.cta', 'Learn more'),
      },
    ],
    [t],
  )

  const sdkCards = useMemo(
    () => [
      {
        icon: 'javascript',
        title: t('docs.apiSdks.cards.node.title', 'Node.js SDK'),
        description: t(
          'docs.apiSdks.cards.node.description',
          'Integrate HyperPay into your backend with our official Node.js library.',
        ),
        version: 'v2.4.0',
        updated: t('docs.apiSdks.cards.node.updated', 'Updated 2d ago'),
      },
      {
        icon: 'smartphone',
        title: t('docs.apiSdks.cards.mobile.title', 'iOS & Android SDKs'),
        description: t(
          'docs.apiSdks.cards.mobile.description',
          'Native mobile components for seamless checkout experiences in your apps.',
        ),
        version: 'v1.8.2',
        updated: t('docs.apiSdks.cards.mobile.updated', 'Updated 1w ago'),
      },
    ],
    [t],
  )

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-12">
        <div className="mb-12">
          <h1 className="text-slate-900 text-4xl md:text-5xl font-black tracking-tight mb-4">
            {t('docs.hero.title', 'Documentation')}
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
            {t(
              'docs.hero.subtitle',
              "Everything you need to integrate HyperPay into your application. From basic setup to advanced API features, we've got you covered.",
            )}
          </p>
        </div>

        <div className="border-b border-slate-200 mb-10 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {([
              {
                key: 'getting-started',
                icon: 'rocket_launch',
                label: t('docs.tabs.gettingStarted', 'Getting Started'),
              },
              {
                key: 'api',
                icon: 'code',
                label: t('docs.tabs.api', 'API Reference'),
              },
              {
                key: 'sdks',
                icon: 'terminal',
                label: t('docs.tabs.sdks', 'SDKs'),
              },
              {
                key: 'resources',
                icon: 'menu_book',
                label: t('docs.tabs.resources', 'Resources'),
              },
            ] as const).map((x) => {
              const active = tab === x.key
              return (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => setTab(x.key)}
                  className={[
                    'pb-4 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors',
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  <span className="material-symbols-outlined text-lg">{x.icon}</span>
                  {x.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('docs.cms.title', 'Docs from CMS')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docPages.map((doc) => (
                <Card key={doc.id} className="hover:border-primary/50 hover:shadow-lg transition-all">
                  <CardBody>
                    <h3 className="text-lg font-bold mb-2">{doc.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {doc.excerpt ?? t('docs.cms.noExcerpt', 'No excerpt available.')}
                    </p>
                    <button
                      type="button"
                      className="text-primary text-sm font-semibold hover:underline"
                      onClick={() => navigate(`/blog/${doc.slug}`)}
                    >
                      {t('docs.cms.open', 'Open')}
                    </button>
                  </CardBody>
                </Card>
              ))}
              {docPages.length === 0 && !docError && (
                <p className="text-sm text-slate-500">{t('docs.cms.empty', 'No docs found from API.')}</p>
              )}
            </div>
            {docError && <p className="text-xs text-red-600 mt-2">{docError}</p>}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('docs.gettingStarted.title', 'Getting Started')}
              </h2>
              <button type="button" className="text-primary text-sm font-semibold hover:underline">
                {t('docs.common.viewAll', 'View all')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gettingStartedCards.map((c) => (
                <Card key={c.title} className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                  <CardBody>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      <span className="material-symbols-outlined">{c.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{c.description}</p>
                    <span className="text-primary text-sm font-semibold flex items-center gap-1">
                      {c.cta}{' '}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('docs.apiSdks.title', 'API & SDKs')}
              </h2>
              <button type="button" className="text-primary text-sm font-semibold hover:underline">
                {t('docs.common.viewAll', 'View all')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-slate-900 text-white p-6 rounded-xl border border-slate-800 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 text-white">
                    <span className="material-symbols-outlined">api</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {t('docs.apiSdks.coreApi.title', 'Core API Reference')}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {t(
                      'docs.apiSdks.coreApi.description',
                      'Detailed technical documentation for every endpoint, parameter, and response object.',
                    )}
                  </p>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    {t('docs.apiSdks.coreApi.cta', 'Explore API')}{' '}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">code</span>
                </div>
              </div>

              {sdkCards.map((c) => (
                <Card key={c.title} className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                  <CardBody>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600">{c.icon}</span>
                      </div>
                      <h3 className="text-lg font-bold">{c.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{c.description}</p>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>{c.version}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {c.updated}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">{t('docs.help.title', 'Need help?')}</h2>
                <p className="text-slate-600 mb-8">
                  {t(
                    'docs.help.subtitle',
                    "Whether you're troubleshooting a technical issue or exploring how to scale your business, our team and community are here to support you.",
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary p-2 bg-white rounded-lg shadow-sm">
                      support_agent
                    </span>
                    <div>
                      <p className="font-bold text-sm">
                        {t('docs.help.items.support.title', '24/7 Priority Support')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('docs.help.items.support.subtitle', 'Live chat for Enterprise users')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary p-2 bg-white rounded-lg shadow-sm">
                      forum
                    </span>
                    <div>
                      <p className="font-bold text-sm">
                        {t('docs.help.items.forum.title', 'Community Forum')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('docs.help.items.forum.subtitle', 'Join 5,000+ developers')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                <Button className="w-full" onClick={() => navigate('/settings/profile')}>
                  {t('docs.help.contact', 'Contact Support')}
                </Button>
                <Button variant="secondary" className="w-full">
                  {t('docs.help.pdf', 'Documentation PDF')}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}

