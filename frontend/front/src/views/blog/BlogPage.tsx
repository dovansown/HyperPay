import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type BlogPost = {
  slug: string
  badge: string
  title: string
  excerpt: string
  date: string
  readTime: string
}

const posts: BlogPost[] = [
  {
    slug: 'future-of-digital-payments-2024',
    badge: 'Industry Trends',
    title: 'The Future of Global Digital Payments in 2024',
    excerpt:
      'Instant settlement, embedded finance, and the API economy are reshaping cross-border commerce.',
    date: 'May 24, 2024',
    readTime: '8 min read',
  },
  {
    slug: 'optimizing-checkout-conversion',
    badge: 'Growth',
    title: 'Optimizing Checkout Conversion Rates',
    excerpt: 'Practical tactics to reduce friction and increase successful payments.',
    date: 'Jun 02, 2024',
    readTime: '5 min read',
  },
  {
    slug: 'subscription-economy',
    badge: 'Business',
    title: 'The Rise of Subscription Economy',
    excerpt: 'How subscription billing is evolving and what teams should build next.',
    date: 'May 15, 2024',
    readTime: '12 min read',
  },
]

export const BlogPage: React.FC = () => {
  const { t } = useTranslation()

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
              'Insights on payments, security, and the future of global commerce.',
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="block">
              <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                <CardBody>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {t(`blog.badges.${p.slug}`, p.badge)}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(`blog.posts.${p.slug}.title`, p.title)}</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {t(`blog.posts.${p.slug}.excerpt`, p.excerpt)}
                  </p>
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                    <span>{p.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{p.readTime}</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
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

