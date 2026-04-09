import { useLanguage } from '@/context/LanguageContext';

export function Partners() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-12 border-t border-[#f0f0f0]">
      <div className="max-w-[1400px] mx-auto px-10">
        <h2 className="text-center text-[20px] font-semibold text-dark mb-9">{t('partners.title')}</h2>
        <div className="flex items-center justify-center gap-14 flex-wrap">
          <span className="text-[24px] font-semibold text-gray opacity-60" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Canva</span>
          <span className="text-[24px] font-extrabold text-gray opacity-60">amazon</span>
          <span className="text-[24px] font-semibold text-gray opacity-60">Google</span>
          <span className="text-[24px] font-semibold text-gray opacity-60">Figma</span>
          <span className="text-[24px] font-semibold text-gray opacity-60">upwork</span>
          <span className="text-[24px] font-semibold text-gray opacity-60">omron</span>
        </div>
      </div>
    </section>
  );
}
