import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { PublicLayout } from '../public/PublicLayout'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import type { PublicContentItem } from '../../lib/contentApi'

export const ContentPreviewPage: React.FC = () => {
  const { t } = useTranslation()
  const { token } = useParams()
  const [item, setItem] = useState<PublicContentItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setError(null)
      try {
        const res = await apiFetch<PublicContentItem | ApiEnvelope<PublicContentItem>>(
          `/public/content/preview/${token}`,
          {
            method: 'GET',
          },
        )
        setItem(unwrapApiData(res))
      } catch (e) {
        setError(e instanceof Error ? e.message : t('content.preview.errorLoad', 'Failed to load preview'))
      }
    }
    void load()
  }, [t, token])

  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-slate-900 mb-4">
          {t('content.preview.title', 'Content Preview')}
        </h1>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}
        {!error && !item && (
          <p className="text-sm text-slate-500">{t('content.preview.loading', 'Loading preview...')}</p>
        )}
        {item && (
          <article className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
            <p className="text-slate-600">{item.excerpt}</p>
            <div className="whitespace-pre-wrap text-slate-700">{item.content}</div>
          </article>
        )}
      </section>
    </PublicLayout>
  )
}
