import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Book, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicContentBySlug, fetchPublicContentList } from '@/store/slices/contentSlice';

export function Docs() {
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { list, listStatus, listError } = useAppSelector((s) => s.content);
  const item = useAppSelector((s) => (slug ? s.content.bySlug[slug] : undefined));
  const itemStatus = useAppSelector((s) => (slug ? s.content.itemStatusBySlug[slug] : undefined));
  const itemError = useAppSelector((s) => (slug ? s.content.itemErrorBySlug[slug] : undefined));

  useEffect(() => {
    void dispatch(fetchPublicContentList({ type: 'DOC_PAGE', limit: 50, offset: 0 }));
  }, [dispatch]);

  const docs = useMemo(() => list.filter((x) => x.type === 'DOC_PAGE'), [list]);
  const activeSlug = slug ?? docs[0]?.slug;

  useEffect(() => {
    if (!activeSlug) return;
    void dispatch(fetchPublicContentBySlug({ slug: activeSlug }));
  }, [activeSlug, dispatch]);

  useEffect(() => {
    if (listError) toast.error(listError);
  }, [listError]);

  useEffect(() => {
    if (itemError) toast.error(itemError);
  }, [itemError]);

  const SidebarContent = () => (
    <nav className="space-y-6">
      <div>
        <h4 className="font-bold text-dark mb-3 px-3 uppercase text-xs tracking-wider">{t('docs.getting_started')}</h4>
        <ul className="space-y-1">
          {docs.map((d) => (
            <li key={d.slug}>
              <Link
                to={`/docs/${d.slug}`}
                onClick={() => setIsSidebarOpen(false)}
                className={
                  'block px-3 py-2 text-sm rounded-lg transition-colors ' +
                  (d.slug === activeSlug ? 'text-primary bg-primary/5 font-medium' : 'text-gray hover:text-dark hover:bg-gray-50')
                }
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
        {listStatus === 'loading' && <div className="px-3 text-xs text-gray">{t('common.loading')}</div>}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar />
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden sticky top-[73px] z-40 bg-white border-b border-[#e8e8e8] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-dark font-bold text-sm">
          <Book size={18} className="text-primary" />
          {t('nav.docs')}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray hover:text-dark"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex-1 flex max-w-[1400px] mx-auto w-full relative">
        {/* Sidebar (Desktop) */}
        <aside className="w-64 border-r border-[#e8e8e8] py-8 pr-6 hidden md:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Sidebar (Mobile) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-[125px] left-0 bottom-0 w-[280px] bg-white z-50 p-6 border-r border-[#e8e8e8] md:hidden overflow-y-auto"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 py-8 px-6 md:px-12 max-w-4xl min-w-0">
          <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">{item?.title ?? t('docs.title')}</h1>

            {item?.excerpt && <p className="text-lg text-gray mb-8">{item.excerpt}</p>}

            {itemStatus === 'loading' && <p className="text-gray">{t('common.loading')}</p>}

            {item?.content ? (
              /<\/?[a-z][\s\S]*>/i.test(item.content) ? (
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              ) : (
                <div className="whitespace-pre-wrap text-gray">{item.content}</div>
              )
            ) : null}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
