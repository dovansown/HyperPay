import { apiFetch, unwrapApiData, type ApiEnvelope } from './apiClient'

export type PublicContentType = 'BLOG_POST' | 'DOC_PAGE' | 'HELP_ARTICLE'

export type PublicContentItem = {
  id: string
  type: PublicContentType
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  published_at: string | null
  categories: Array<{ id: string; name: string; slug: string }>
  tags: Array<{ id: string; name: string; slug: string }>
}

export async function listPublicContent(params: {
  type?: PublicContentType
  category?: string
  tag?: string
  q?: string
  limit?: number
  offset?: number
}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.category) query.set('category', params.category)
  if (params.tag) query.set('tag', params.tag)
  if (params.q) query.set('q', params.q)
  if (params.limit != null) query.set('limit', String(params.limit))
  if (params.offset != null) query.set('offset', String(params.offset))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  const res = await apiFetch<PublicContentItem[] | ApiEnvelope<PublicContentItem[]>>(
    `/public/content${suffix}`,
    {
      method: 'GET',
    },
  )
  return unwrapApiData(res)
}

export async function getPublicContentBySlug(slug: string) {
  const res = await apiFetch<PublicContentItem | ApiEnvelope<PublicContentItem>>(
    `/public/content/${slug}`,
    {
      method: 'GET',
    },
  )
  return unwrapApiData(res)
}

export async function listPublicCategories() {
  const res = await apiFetch<
    Array<{ id: string; name: string; slug: string }> | ApiEnvelope<Array<{ id: string; name: string; slug: string }>>
  >('/public/content/categories', {
    method: 'GET',
  })
  return unwrapApiData(res)
}

export async function listPublicTags() {
  const res = await apiFetch<
    Array<{ id: string; name: string; slug: string }> | ApiEnvelope<Array<{ id: string; name: string; slug: string }>>
  >('/public/content/tags', {
    method: 'GET',
  })
  return unwrapApiData(res)
}
