import { Facebook, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-footer pt-[60px] pb-6 text-[#888]">
      <div className="max-w-[1400px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-10">
          <div className="lg:col-span-2">
            <div className="text-[20px] font-bold text-white mb-4">
              <span className="text-primary">M</span>oneta
            </div>
            <p className="text-sm leading-[1.7] text-gray mb-5">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-[#2a3a30] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-primary transition-colors cursor-pointer">
                <Facebook size={16} />
              </div>
              <div className="w-9 h-9 bg-[#2a3a30] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-primary transition-colors cursor-pointer">
                <Linkedin size={16} />
              </div>
              <div className="w-9 h-9 bg-[#2a3a30] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-primary transition-colors cursor-pointer">
                <Twitter size={16} />
              </div>
              <div className="w-9 h-9 bg-[#2a3a30] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-primary transition-colors cursor-pointer">
                <Youtube size={16} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[15px] font-semibold text-white mb-5">{t('footer.follow')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">Facebook</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] font-semibold text-white mb-5">{t('footer.links')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('nav.home')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('nav.features')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('nav.pricing')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] font-semibold text-white mb-5">{t('footer.benefits')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.security')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.analytics')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.savings')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.rewards')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] font-semibold text-white mb-5">{t('footer.support')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.help_center')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.contact_us')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-primary transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#2a3a30] pt-6 text-right text-[13px] text-[#555]">
          © 2024 Moneta. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
