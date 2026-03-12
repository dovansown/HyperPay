import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { getPublicContentBySlug, listPublicContent, type PublicContentItem } from '../../lib/contentApi'

const DEFAULT_SLUG = 'future-of-digital-payments-2024'

export const BlogPostPage: React.FC = () => {
  const { t } = useTranslation()
  const params = useParams()
  const slug = params.slug ?? DEFAULT_SLUG
  const [item, setItem] = useState<PublicContentItem | null>(null)
  const [related, setRelated] = useState<PublicContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [post, list] = await Promise.all([
          getPublicContentBySlug(slug),
          listPublicContent({ type: 'BLOG_POST', limit: 3, offset: 0 }),
        ])
        setItem(post)
        setRelated(list.filter((x) => x.slug !== slug).slice(0, 2))
      } catch (e) {
        setError(e instanceof Error ? e.message : t('blogPost.errorLoad', 'Failed to load article'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [slug, t])

  return (
    <PublicLayout>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">payments</span>
            {item?.categories[0]?.name ?? t('blogPost.badge', 'Industry Trends')}
          </div>
          <h1 className="text-slate-900 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] mb-8 tracking-tight">
            {item?.title ?? t('blogPost.loadingTitle', 'Loading article...')}
          </h1>
          <div className="text-slate-500 text-sm">
            {item?.published_at
              ? new Date(item.published_at).toLocaleString()
              : t('blogPost.draftPreview', 'Draft preview')}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 py-12">
          <article className="flex-1 max-w-2xl mx-auto">
            {loading && <p className="text-slate-500">{t('blogPost.loading', 'Loading...')}</p>}
            {item?.excerpt && <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">{item.excerpt}</p>}
            {item?.cover_image && (
              <img src={item.cover_image} alt={item.title} className="w-full rounded-xl border border-slate-200 mb-8" />
            )}
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{item?.content ?? ''}</p>
            </div>
            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold mb-4">{t('blogPost.tags.title', 'Tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {(item?.tags ?? []).map((tag) => (
                  <span key={tag.id} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                    {tag.name}
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
                  {related.map((x) => (
                    <Link key={x.slug} className="group block" to={`/blog/${x.slug}`}>
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                      </div>
                      <h4 className="text-slate-900 font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                        {x.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-2">
                        {x.published_at
                          ? new Date(x.published_at).toLocaleDateString()
                          : t('blogPost.related.draft', 'Draft')}
                      </p>
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
        {error && (
          <div className="max-w-7xl mx-auto px-6 pb-12 text-xs text-red-600">
            {error}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}

