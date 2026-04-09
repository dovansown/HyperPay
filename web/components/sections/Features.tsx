import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function Features() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="max-w-[1400px] mx-auto px-10">
        <h2 className="text-center text-[32px] font-bold text-dark mb-15">{t('features.title')}</h2>
        
        <div className="flex flex-col gap-8">
          {/* Smart Spending Alerts */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="bg-[#f2f7f6] rounded-[20px] p-10 flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] w-full max-w-[500px] lg:max-w-none">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl mb-3 -rotate-2 shadow-sm transition-transform hover:rotate-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-[#f0e6ff]">🎨</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-dark mb-0.5">{t('features.spent_at')} <span className="text-red-500">$9.25</span> {t('features.at')} Figma</div>
                  <div className="text-[11px] text-light-gray">{t('common.today')} · 07:15 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl mb-3 rotate-1 shadow-sm transition-transform hover:rotate-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-[#ffe6f0]">🏀</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-dark mb-0.5">{t('features.received_from')} <span className="text-primary">$7.15</span> {t('features.from')} Dribbble</div>
                  <div className="text-[11px] text-light-gray">{t('common.today')} · 03:10 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl mb-3 -rotate-1 shadow-sm transition-transform hover:rotate-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-[#e6f0ff]">▶️</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-dark mb-0.5">{t('features.spent_at')} <span className="text-red-500">$12.3</span> {t('features.at')} Google Play</div>
                  <div className="text-[11px] text-light-gray">{t('common.today')} · 10:32 AM</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-[20px] font-bold text-dark mb-3 leading-[1.4]">{t('features.spending_alerts_title')}</h3>
              <p className="text-[14px] text-gray leading-[1.7] mb-5">
                {t('features.spending_alerts_desc')}
              </p>
              <button className="bg-gradient-to-br from-primary to-primary-dark text-white border-none px-6 py-3 rounded-full text-sm font-semibold cursor-pointer inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                {t('features.explore_more')} 
                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-xs">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>

          {/* Balance & Expense Tracker */}
          <div className="flex flex-col-reverse lg:flex-row gap-12 items-center mt-15">
            <div className="flex-1">
              <h3 className="text-[20px] font-bold text-dark mb-3 leading-[1.4]">{t('features.tracker_title')}</h3>
              <p className="text-[14px] text-gray leading-[1.7] mb-5">
                {t('features.tracker_desc')}
              </p>
              <button className="bg-gradient-to-br from-primary to-primary-dark text-white border-none px-6 py-3 rounded-full text-sm font-semibold cursor-pointer inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                {t('features.explore_more')} 
                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-xs">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
            <div className="bg-[#f2f7f6] rounded-[20px] p-10 flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] w-full max-w-[500px] lg:max-w-none">
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-light-gray">{t('dashboard.balance')}</div>
                  <div className="text-xs border px-2 py-1 rounded-md text-gray-500">2 Months ago v</div>
                </div>
                <div className="text-[28px] font-bold text-dark mb-5">$206,117.83</div>
                <div className="relative h-[100px] mb-4">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2ecc71" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 70 L 40 60 L 80 65 L 120 40 L 160 45 L 200 25 L 200 100 L 0 100 Z" fill="url(#gradient1)"/>
                    <path d="M 0 70 L 40 60 L 80 65 L 120 40 L 160 45 L 200 25" fill="none" stroke="#2ecc71" strokeWidth="2"/>
                    <path d="M 0 80 L 40 75 L 80 78 L 120 60 L 160 65 L 200 50 L 200 100 L 0 100 Z" fill="url(#gradient2)"/>
                    <path d="M 0 80 L 40 75 L 80 78 L 120 60 L 160 65 L 200 50" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeDasharray="4 4"/>
                    <circle cx="160" cy="45" r="4" fill="#2ecc71" />
                    <circle cx="160" cy="65" r="4" fill="#1a1a1a" />
                  </svg>
                  <div className="absolute top-2 right-10 bg-dark text-white text-[10px] px-2 py-1 rounded">
                    Dec, 2024<br/>$89,110
                  </div>
                </div>
                <div className="flex gap-4 text-[11px] text-light-gray justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-primary"></div>
                    <span>{t('dashboard.income')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-dark"></div>
                    <span>{t('dashboard.expense')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
