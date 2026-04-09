import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function Pricing() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.starter_name'),
      price: "0",
      description: t('pricing.starter_desc'),
      features: [
        t('pricing.feature_api_1k'),
        t('pricing.feature_analytics_basic'),
        t('pricing.feature_support_comm'),
        t('pricing.feature_bank_1'),
        t('pricing.feature_webhook_std')
      ]
    },
    {
      name: t('pricing.pro_name'),
      price: "49",
      popular: true,
      description: t('pricing.pro_desc'),
      features: [
        t('pricing.feature_api_10k'),
        t('pricing.feature_analytics_adv'),
        t('pricing.feature_support_email'),
        t('pricing.feature_bank_unlimited'),
        t('pricing.feature_webhook_custom'),
        t('pricing.feature_team_5')
      ]
    },
    {
      name: t('pricing.enterprise_name'),
      price: "199",
      description: t('pricing.enterprise_desc'),
      features: [
        t('pricing.feature_api_unlimited'),
        t('pricing.feature_analytics_custom'),
        t('pricing.feature_support_247'),
        t('pricing.feature_manager'),
        t('pricing.feature_sla'),
        t('pricing.feature_team_unlimited'),
        t('pricing.feature_integrations')
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Pricing Cards */}
        <section className="py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-2xl p-8 border relative flex flex-col",
                    plan.popular 
                      ? "border-primary shadow-xl bg-white scale-105 z-10" 
                      : "border-[#e8e8e8] bg-white"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                      {t('pricing.popular')}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-dark mb-2">{plan.name}</h3>
                  <p className="text-gray text-sm mb-6 h-10">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-dark">${plan.price}</span>
                    <span className="text-gray">/{t('pricing.month')}</span>
                  </div>
                  <Button 
                    variant={plan.popular ? "primary" : "outline"} 
                    className="w-full mb-8 rounded-xl py-3"
                  >
                    {t('hero.cta')}
                  </Button>
                  <div className="flex flex-col gap-4 flex-1">
                    <p className="text-sm font-bold text-dark">{t('pricing.included')}</p>
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <Check size={18} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-gray text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-section-bg">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-dark text-center mb-12">{t('pricing.faq_title')}</h2>
            <div className="flex flex-col gap-6">
              {[
                { q: t('pricing.faq1_q'), a: t('pricing.faq1_a') },
                { q: t('pricing.faq2_q'), a: t('pricing.faq2_a') },
                { q: t('pricing.faq3_q'), a: t('pricing.faq3_a') }
              ].map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#e8e8e8]">
                  <h4 className="text-lg font-bold text-dark mb-2">{faq.q}</h4>
                  <p className="text-gray">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
