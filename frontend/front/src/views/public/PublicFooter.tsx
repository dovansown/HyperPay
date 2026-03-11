import React from 'react'
import { useTranslation } from 'react-i18next'

type FooterColumn = {
  title: string
  links: string[]
}

export const PublicFooter: React.FC = () => {
  const { t } = useTranslation()

  const cols: FooterColumn[] = [
    {
      title: t('public.footer.cols.product', 'Product'),
      links: [
        t('public.footer.links.checkout', 'Checkout'),
        t('public.footer.links.elements', 'Elements'),
        t('public.footer.links.invoicing', 'Invoicing'),
        t('public.footer.links.subscriptions', 'Subscriptions'),
      ],
    },
    {
      title: t('public.footer.cols.resources', 'Resources'),
      links: [
        t('public.footer.links.documentation', 'Documentation'),
        t('public.footer.links.api', 'API Reference'),
        t('public.footer.links.community', 'Community'),
        t('public.footer.links.helpCenter', 'Help Center'),
      ],
    },
    {
      title: t('public.footer.cols.company', 'Company'),
      links: [
        t('public.footer.links.about', 'About Us'),
        t('public.footer.links.careers', 'Careers'),
        t('public.footer.links.blog', 'Blog'),
        t('public.footer.links.contact', 'Contact'),
      ],
    },
    {
      title: t('public.footer.cols.legal', 'Legal'),
      links: [
        t('public.footer.links.privacy', 'Privacy Policy'),
        t('public.footer.links.terms', 'Terms of Service'),
        t('public.footer.links.cookies', 'Cookie Settings'),
      ],
    },
  ]

  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-12 md:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-primary">
              <svg className="size-6" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">HyperPay</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {t(
              'public.footer.tagline',
              'Simplified payments for the next generation of digital commerce.',
            )}
          </p>
          <div className="flex gap-4">
            {['public', 'share', 'alternate_email'].map((i) => (
              <a key={i} className="text-slate-400 hover:text-primary" href="#">
                <span className="material-symbols-outlined">{i}</span>
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-bold text-slate-900 mb-6">{c.title}</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              {c.links.map((l) => (
                <li key={l}>
                  <a className="hover:text-primary" href="#">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-400 text-xs">{t('public.footer.copyright', '© 2024 HyperPay Inc. All rights reserved.')}</p>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="material-symbols-outlined text-sm">language</span>
          <span>{t('public.footer.locale', 'English (United States)')}</span>
        </div>
      </div>
    </footer>
  )
}

