import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Zap, Globe, Workflow, ArrowRight, CheckCircle2, Code2, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export function Features() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Bento Grid Section */}
        <section className="py-24 bg-section-bg">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-0 transition-transform group-hover:scale-110 duration-700"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-4">{t('features.fast_title')}</h3>
                  <p className="text-gray text-lg max-w-md mb-8">
                    {t('features.fast_desc')}
                  </p>
                  <ul className="space-y-3">
                    {[t('features.latency'), t('features.idempotent'), t('features.retries')].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-dark font-medium">
                        <CheckCircle2 size={20} className="text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Card 2: Dark */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-dark rounded-3xl p-8 md:p-12 relative overflow-hidden group text-white"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                    <Shield size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('features.security_title')}</h3>
                  <p className="text-gray-400 text-lg mb-8">
                    {t('features.security_desc')}
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-primary">
                    <span className="text-gray-500">// Data encryption</span><br/>
                    encrypt(payload, AES_256_GCM);
                  </div>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 md:p-12"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f0f4ff] flex items-center justify-center mb-6 text-[#4a6cf7]">
                  <Globe size={28} />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">{t('features.global_title')}</h3>
                <p className="text-gray text-lg">
                  {t('features.global_desc')}
                </p>
              </motion.div>

              {/* Card 4: Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center"
              >
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#fff4e5] flex items-center justify-center mb-6 text-[#ff9800]">
                    <Workflow size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-4">{t('features.workflow_title')}</h3>
                  <p className="text-gray text-lg mb-6">
                    {t('features.workflow_desc')}
                  </p>
                  <Link to="/integrations" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    {t('features.explore_integrations')} <ArrowRight size={18} />
                  </Link>
                </div>
                <div className="flex-1 w-full bg-section-bg rounded-2xl p-6">
                  <div className="flex flex-col gap-3">
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3 text-sm font-medium text-dark">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Zap size={14}/></div>
                      {t('features.payment_received')}
                    </div>
                    <div className="w-0.5 h-4 bg-[#e8e8e8] ml-7"></div>
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3 text-sm font-medium text-dark">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><Code2 size={14}/></div>
                      {t('features.update_db')}
                    </div>
                    <div className="w-0.5 h-4 bg-[#e8e8e8] ml-7"></div>
                    <div className="bg-white p-3 rounded-lg flex items-center gap-3 text-sm font-medium text-dark">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500"><Mail size={14}/></div>
                      {t('features.send_receipt')}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Deep Dive Section */}
        <section className="py-32">
          <div className="max-w-[1400px] mx-auto px-6 flex flex-col gap-32">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">{t('features.analytics_title')}</h2>
                  <p className="text-lg text-gray mb-8 leading-relaxed">
                    {t('features.analytics_desc')}
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><CheckCircle2 size={14} /></div>
                      <div>
                        <strong className="text-dark block">{t('features.realtime_dashboards')}</strong>
                        <span className="text-gray text-sm">{t('features.realtime_dashboards_desc')}</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><CheckCircle2 size={14} /></div>
                      <div>
                        <strong className="text-dark block">{t('features.custom_reports')}</strong>
                        <span className="text-gray text-sm">{t('features.custom_reports_desc')}</span>
                      </div>
                    </li>
                  </ul>
                </motion.div>
              </div>
              <div className="flex-1 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl overflow-hidden"
                >
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" alt="Analytics Dashboard" className="w-full h-auto" />
                </motion.div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">{t('features.api_title')}</h2>
                  <p className="text-lg text-gray mb-8 leading-relaxed">
                    {t('features.api_desc')}
                  </p>
                  <div className="bg-dark rounded-2xl p-6 text-sm font-mono text-gray-300 shadow-xl">
                    <div className="flex gap-2 mb-4 border-b border-gray-700 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p><span className="text-primary">curl</span> https://api.moneta.com/v1/payments \</p>
                    <p className="ml-4">-H <span className="text-yellow-300">"Authorization: Bearer sk_test_..."</span> \</p>
                    <p className="ml-4">-d amount=<span className="text-blue-400">2000</span> \</p>
                    <p className="ml-4">-d currency=<span className="text-yellow-300">"usd"</span></p>
                  </div>
                </motion.div>
              </div>
              <div className="flex-1 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl overflow-hidden"
                >
                  <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000" alt="API Code" className="w-full h-auto" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">{t('features.cta_title')}</h2>
            <p className="text-xl text-white/80 mb-10">{t('features.cta_desc')}</p>
            <Link to="/register">
              <Button className="bg-white text-primary hover:bg-gray-50 px-10 py-4 rounded-full text-[16px] font-bold shadow-lg">
                {t('features.create_account')}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
