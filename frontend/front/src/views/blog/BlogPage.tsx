import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { listPublicCategories, listPublicContent, type PublicContentItem } from '../../lib/contentApi'

export const BlogPage: React.FC = () => {
  const { t } = useTranslation()
  const [items, setItems] = useState<PublicContentItem[]>([])
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [posts, cats] = await Promise.all([
          listPublicContent({
            type: 'BLOG_POST',
            q: query || undefined,
            category: selectedCategory || undefined,
            limit: 30,
            offset: 0,
          }),
          listPublicCategories(),
        ])
        setItems(posts)
        setCategories(cats)
      } catch (e) {
        setError(e instanceof Error ? e.message : t('blog.filters.errorLoad', 'Failed to load blog posts'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [query, selectedCategory])

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            {t('blog.title', 'Blog')}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t(
              'blog.subtitle',
              'Insights on payments, security, and the future of global commerce from CMS data.',
            )}
          </p>
        </header>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('blog.filters.search', 'Search blog posts')}
          />
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">{t('blog.filters.allCategories', 'All categories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => {
            setQuery('')
            setSelectedCategory('')
          }}>
            {t('blog.filters.reset', 'Reset filters')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!loading && items.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="block">
              <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                <CardBody>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {p.categories[0]?.name ?? t('blog.badgeDefault', 'Blog')}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {p.excerpt ?? t('blog.noExcerpt', 'No excerpt available.')}
                  </p>
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                    <span>
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString()
                        : t('blog.draft', 'Draft')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{t('blog.tagCount', '{{count}} tags', { count: p.tags.length })}</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
          {loading && (
            <p className="text-sm text-slate-500">{t('blog.loading', 'Loading blog posts...')}</p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-slate-500">
              {t('blog.empty', 'No blog posts matched your filters.')}
            </p>
          )}
        </div>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-4">
            {error}
          </div>
        )}
      </section>

      <section className="bg-slate-900 py-20 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-3xl font-black mb-4">
            {t('blog.newsletter.title', 'Stay ahead of the curve')}
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            {t(
              'blog.newsletter.subtitle',
              'Get the latest insights on global payments, security, and the future of commerce delivered to your inbox.',
            )}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder={t('blog.newsletter.placeholder', 'Your work email')}
              className="bg-slate-800 text-white border-0 focus:ring-primary"
            />
            <Button type="button">
              {t('blog.newsletter.cta', 'Subscribe')}
            </Button>
          </form>
          <p className="text-slate-500 text-xs mt-6 italic">
            {t('blog.newsletter.note', 'No spam, just quality insights. Unsubscribe at any time.')}
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}

