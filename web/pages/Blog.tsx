import { useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicContentList } from '@/store/slices/contentSlice';

export function Blog() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { list, listStatus, listError } = useAppSelector((s) => s.content);

  useEffect(() => {
    void dispatch(fetchPublicContentList({ type: 'BLOG_POST', limit: 12, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (listError) toast.error(listError);
  }, [listError]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Blog Grid */}
        <section className="py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-3xl font-bold text-dark text-center mb-12">{t('blog.title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.cover_image || 'https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1200&auto=format&fit=crop'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[12px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {(post.category_slugs?.[0] ?? 'blog').replace(/-/g, ' ')}
                      </span>
                      <span className="text-[12px] text-gray">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray text-sm mb-6 line-clamp-3 flex-1">
                      {post.excerpt ?? ''}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e8e8e8]">
                      <span className="text-[13px] text-gray font-medium">{post.slug}</span>
                      <span className="text-primary flex items-center gap-1 text-[13px] font-bold group-hover:gap-2 transition-all">
                        {t('blog.read_more')} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {listStatus === 'loading' && (
              <div className="mt-6 text-center text-sm text-gray">{t('common.loading')}</div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
