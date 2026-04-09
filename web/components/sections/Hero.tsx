import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-12 md:py-20 pb-10 md:pb-15">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-15">
        <div className="flex-1 max-w-[500px]">
          <h1 className="text-4xl md:text-[48px] font-extrabold leading-[1.2] text-dark mb-5">
            {t('hero.title')}
          </h1>
          <p className="text-base text-gray leading-[1.7] mb-8">
            {t('hero.subtitle')}
          </p>
          <Button className="gap-2">
            {t('hero.cta')} <ArrowRight size={18} />
          </Button>
          
          <div className="flex flex-wrap gap-6 sm:gap-12 mt-10 md:mt-12">
            <div className="pr-6 sm:pr-12 border-r-2 border-[#e8e8e8]">
              <h3 className="text-2xl sm:text-[28px] font-bold text-dark mb-1">873 M</h3>
              <p className="text-[11px] sm:text-[13px] text-light-gray uppercase tracking-[0.5px]">{t('hero.users_active')}</p>
            </div>
            <div className="pr-6 sm:pr-12 border-r-2 border-[#e8e8e8]">
              <h3 className="text-2xl sm:text-[28px] font-bold text-dark mb-1">50+</h3>
              <p className="text-[11px] sm:text-[13px] text-light-gray uppercase tracking-[0.5px]">{t('hero.countries')}</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-[28px] font-bold text-dark mb-1">#1</h3>
              <p className="text-[11px] sm:text-[13px] text-light-gray uppercase tracking-[0.5px]">{t('hero.finance_app')}</p>
            </div>
          </div>
        </div>
        
        <div className="relative w-full max-w-[400px] h-[280px] shrink-0 hidden lg:block">
          <div className="absolute w-[280px] h-[170px] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col justify-between bg-gradient-to-br from-[#c8e6d0] to-[#d8f0e0] top-5 right-0 rotate-8 z-10">
            <div className="text-sm font-bold text-[#2d5a3d]">Moneta</div>
            <div className="w-10 h-8 bg-gradient-to-br from-[#f4d03f] to-[#e6b800] rounded-md my-2"></div>
            <div className="text-base tracking-[2px] text-[#2d5a3d] font-medium mt-auto">5391 3729 5537 7650</div>
            <div className="flex justify-between text-[11px] text-[#4a6a54] mt-2">
              <span>{t('hero.cardholder')}</span>
              <span>12/26</span>
            </div>
          </div>
          <div className="absolute w-[280px] h-[170px] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col justify-between bg-gradient-to-br from-[#b5ddc4] to-[#c8e8d4] top-[60px] right-[80px] -rotate-4 z-20">
            <div className="text-sm font-bold text-[#2d5a3d]">Moneta</div>
            <div className="w-10 h-8 bg-gradient-to-br from-[#f4d03f] to-[#e6b800] rounded-md my-2"></div>
            <div className="text-base tracking-[2px] text-[#2d5a3d] font-medium mt-auto">4821 •••• •••• 9012</div>
            <div className="flex justify-between text-[11px] text-[#4a6a54] mt-2">
              <span>Karina Lim</span>
              <span>08/27</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
