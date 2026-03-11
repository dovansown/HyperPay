import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'

const DEFAULT_SLUG = 'future-of-digital-payments-2024'

export const BlogPostPage: React.FC = () => {
  const { t } = useTranslation()
  const params = useParams()
  const slug = params.slug ?? DEFAULT_SLUG

  const title = t('blogPost.title', 'The Future of Global Digital Payments in 2024')
  const subtitle = t(
    'blogPost.lead',
    'In an increasingly interconnected world, the infrastructure of commerce is undergoing a profound transformation.',
  )

  return (
    <PublicLayout>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">payments</span>
            {t('blogPost.badge', 'Industry Trends')}
          </div>
          <h1 className="text-slate-900 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] mb-8 tracking-tight">
            {title.split('Digital Payments')[0]}
            <span className="text-primary">{t('blogPost.highlight', 'Digital Payments')}</span>
            {title.includes('Digital Payments') ? title.split('Digital Payments')[1] : ''}
          </h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200" />
              <div className="text-left">
                <p className="text-slate-900 font-bold text-base">{t('blogPost.author', 'Alex Rivers')}</p>
                <p className="text-slate-500 text-sm">{t('blogPost.role', 'Head of Product Strategy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
              <span>{t('blogPost.meta.date', 'May 24, 2024')}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{t('blogPost.meta.readTime', '8 min read')}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl relative bg-slate-200">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 py-12">
          <aside className="lg:w-20 flex lg:flex-col items-center gap-6 lg:sticky lg:top-32 h-fit">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
              {t('blogPost.share', 'Share')}
            </span>
            {['twitter', 'linkedin', 'link'].map((k) => (
              <button
                key={k}
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all"
              >
                {k === 'link' ? (
                  <span className="material-symbols-outlined">link</span>
                ) : (
                  <span className="material-symbols-outlined">share</span>
                )}
              </button>
            ))}
          </aside>

          <article className="flex-1 max-w-2xl mx-auto">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">{subtitle}</p>

            <h2 className="text-2xl font-bold mt-10 mb-4">{t('blogPost.sections.s1.title', 'The Shift Toward Instant Settlement')}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t(
                'blogPost.sections.s1.p1',
                'Traditionally, cross-border payments have been plagued by delays, high fees, and a lack of transparency.',
              )}
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t(
                'blogPost.sections.s1.p2',
                "This isn't just a convenience for consumers; it's a vital liquidity management tool for businesses.",
              )}
            </p>

            <blockquote className="border-l-4 border-primary pl-6 italic text-slate-600 my-8">
              {t(
                'blogPost.quote',
                '"The next decade of fintech won’t be about adding new layers of complexity, but about removing the existing friction that costs global commerce billions every year."',
              )}
            </blockquote>

            <h2 className="text-2xl font-bold mt-10 mb-4">{t('blogPost.sections.s2.title', 'Security in a Borderless World')}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t(
                'blogPost.sections.s2.p1',
                'As payment methods evolve, so do the threats. Modern gateways must balance UX with robust fraud prevention.',
              )}
            </p>

            <div className="my-10 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <div className="h-64 bg-slate-100 relative" style={{ backgroundImage: 'linear-gradient(135deg, #645cff22 0%, #645cff05 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-6xl opacity-20">analytics</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 rounded-lg backdrop-blur-sm border border-slate-100">
                  <p className="text-xs font-bold text-primary mb-1">{t('blogPost.insight.label', 'DATA INSIGHT')}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {t('blogPost.insight.value', 'Global digital wallet adoption is projected to grow by 45% by 2026.')}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4">{t('blogPost.sections.s3.title', 'Embedded Finance and the API Economy')}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t(
                'blogPost.sections.s3.p1',
                'The future of payments is invisible. We are moving toward a world where every software platform is a fintech platform.',
              )}
            </p>

            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold mb-4">{t('blogPost.tags.title', 'Tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {['Fintech', 'Payments', 'Global Commerce', 'API'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                    {t(`blogPost.tags.${tag}`, tag)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <Link to="/blog" className="text-primary font-medium hover:underline">
                {t('blogPost.back', 'Back to blog')}
              </Link>
            </div>
          </article>

          <aside className="lg:w-80 hidden xl:block">
            <Card className="bg-white">
              <CardBody className="p-6">
                <h3 className="text-slate-900 font-bold text-lg mb-6">
                  {t('blogPost.related.title', 'Related Articles')}
                </h3>
                <div className="space-y-8">
                  {[
                    { slug: 'optimizing-checkout-conversion', title: 'Optimizing Checkout Conversion Rates', meta: 'Jun 02, 2024 · 5 min read' },
                    { slug: 'subscription-economy', title: 'The Rise of Subscription Economy', meta: 'May 15, 2024 · 12 min read' },
                  ].map((x) => (
                    <Link key={x.slug} className="group block" to={`/blog/${x.slug}`}>
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                      </div>
                      <h4 className="text-slate-900 font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                        {t(`blogPost.related.${x.slug}.title`, x.title)}
                      </h4>
                      <p className="text-slate-500 text-xs mt-2">{t(`blogPost.related.${x.slug}.meta`, x.meta)}</p>
                    </Link>
                  ))}
                </div>
                <Button variant="secondary" className="w-full mt-8">
                  {t('blogPost.related.viewAll', 'View All Articles')}
                </Button>
              </CardBody>
            </Card>
          </aside>
        </div>

        <section className="bg-slate-900 py-20 px-6 mt-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-white text-3xl font-black mb-4">
              {t('blogPost.newsletter.title', 'Stay ahead of the curve')}
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              {t(
                'blogPost.newsletter.subtitle',
                'Get the latest insights on global payments, security, and the future of commerce delivered to your inbox.',
              )}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => {}}>
                {t('blogPost.newsletter.cta', 'Subscribe')}
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-12 text-xs text-slate-400">
          {t('blogPost.debug.slug', 'Slug')}: {slug}
        </div>
      </main>
    </PublicLayout>
  )
}

