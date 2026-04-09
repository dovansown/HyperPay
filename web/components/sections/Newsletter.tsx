import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export function Newsletter() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-[#1a3d2e] to-[#2d5a45] py-20">
      <div className="max-w-[800px] mx-auto px-10 text-center">
        <h2 className="text-[36px] font-bold text-white mb-3">{t('newsletter.title')}</h2>
        <p className="text-[15px] text-[#a8c8b8] mb-9">
          {t('newsletter.subtitle')}
        </p>
        <form className="flex flex-col sm:flex-row max-w-[480px] mx-auto bg-white/10 rounded-full overflow-hidden p-1 backdrop-blur-sm" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder={t('newsletter.placeholder')} 
            className="flex-1 bg-transparent border-none px-6 py-4 text-white text-[15px] outline-none placeholder:text-[#a8c8b8]"
          />
          <Button variant="white" type="submit" className="m-1 rounded-full px-8">
            {t('newsletter.subscribe')}
          </Button>
        </form>
      </div>
    </section>
  );
}
