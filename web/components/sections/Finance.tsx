import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export function Finance() {
  const { t } = useLanguage();

  return (
    <section className="bg-section-bg py-20">
      <div className="max-w-[1400px] mx-auto px-10 flex flex-col lg:flex-row items-center justify-between gap-20">
        <div className="flex-1 max-w-[480px]">
          <h2 className="text-[36px] font-bold leading-[1.3] text-dark mb-5">
            {t('finance.title')}
          </h2>
          <p className="text-[15px] text-gray leading-[1.8] mb-8">
            {t('finance.desc')}
          </p>
          <Button variant="outline" className="gap-3 rounded-full">
            {t('features.explore_more')}
            <div className="w-11 h-6 bg-primary rounded-full relative">
              <div className="absolute w-4 h-4 bg-white rounded-full top-1 right-1"></div>
            </div>
          </Button>
        </div>
        
        <div className="bg-white rounded-[20px] p-8 w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-6">
            <div className="text-xs text-light-gray uppercase tracking-wider mb-2">{t('finance.monthly_overview')}</div>
            <div className="text-[32px] font-bold text-dark">$12,450.00</div>
          </div>
          <div className="flex items-end gap-2 h-[120px] mb-4">
            <div className="flex-1 bg-[#e8f5ee] rounded-t-md h-[45%] transition-all duration-300 hover:bg-primary"></div>
            <div className="flex-1 bg-[#e8f5ee] rounded-t-md h-[65%] transition-all duration-300 hover:bg-primary"></div>
            <div className="flex-1 bg-primary rounded-t-md h-[85%] transition-all duration-300"></div>
            <div className="flex-1 bg-[#e8f5ee] rounded-t-md h-[60%] transition-all duration-300 hover:bg-primary"></div>
            <div className="flex-1 bg-primary rounded-t-md h-[95%] transition-all duration-300"></div>
            <div className="flex-1 bg-[#e8f5ee] rounded-t-md h-[50%] transition-all duration-300 hover:bg-primary"></div>
            <div className="flex-1 bg-[#e8f5ee] rounded-t-md h-[75%] transition-all duration-300 hover:bg-primary"></div>
          </div>
          <div className="h-1 bg-gradient-to-r from-primary to-[#a8e6c1] rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
