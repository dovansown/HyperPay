import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicContentBySlug } from '@/store/slices/contentSlice';

export function BlogPost() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { slug } = useParams();
  const item = useAppSelector((s) => (slug ? s.content.bySlug[slug] : undefined));
  const status = useAppSelector((s) => (slug ? s.content.itemStatusBySlug[slug] : undefined));
  const error = useAppSelector((s) => (slug ? s.content.itemErrorBySlug[slug] : undefined));

  useEffect(() => {
    if (!slug) return;
    void dispatch(fetchPublicContentBySlug({ slug }));
  }, [dispatch, slug]);

  const isHtml = useMemo(() => {
    const c = item?.content ?? '';
    return /<\/?[a-z][\s\S]*>/i.test(c);
  }, [item?.content]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Article Header */}
        <section className="bg-section-bg py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-6">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-medium hover:underline mb-8">
              <ArrowLeft size={16} /> {t('blog.back')}
            </Link>

            {error && (
              <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[13px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Tag size={14} /> {(item?.category_slugs?.[0] ?? 'blog').replace(/-/g, ' ')}
              </span>
              <span className="text-[13px] text-gray flex items-center gap-1.5">
                <Calendar size={14} /> {item?.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
              </span>
              <span className="text-[13px] text-gray flex items-center gap-1.5">
                <Clock size={14} /> {status === 'loading' ? t('common.loading') : ''}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-dark mb-8 leading-tight">
              {item?.title ?? ''}
            </h1>
            
            <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/150?u=sarah" alt="Author" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="text-[14px] font-bold text-dark">Sarah Jenkins</div>
                <div className="text-[13px] text-gray">{t('blog.author_role')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <img 
              src={item?.cover_image || 'https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1200&auto=format&fit=crop'} 
              alt={item?.title ?? ''} 
              className="w-full h-[400px] object-cover rounded-2xl mb-12 shadow-lg"
            />
            
            <div className="prose prose-lg max-w-none text-gray">
              {item?.excerpt && (
                <p className="text-xl leading-relaxed text-dark font-medium mb-8">{item.excerpt}</p>
              )}

              {status === 'loading' && <p>{t('common.loading')}</p>}

              {item?.content ? (
                isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : (
                  <div className="whitespace-pre-wrap">{item.content}</div>
                )
              ) : null}
            </div>
            
            {/* Share & Tags */}
            <div className="mt-16 pt-8 border-t border-[#e8e8e8] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-bold text-dark">{t('blog.tags')}:</span>
                {(item?.tag_slugs ?? []).slice(0, 6).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray text-[13px] rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[14px] font-bold text-dark">{t('blog.share')}:</span>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray hover:text-primary hover:bg-primary/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray hover:text-primary hover:bg-primary/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
