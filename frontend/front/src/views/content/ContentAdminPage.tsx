import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { AdminModal } from '../../components/ui/AdminModal'
import { useAppSelector } from '../../store/hooks'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'

type ContentType = 'BLOG_POST' | 'DOC_PAGE' | 'HELP_ARTICLE'
type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

type AdminContentItem = {
  id: number
  type: ContentType
  status: ContentStatus
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  updated_at: string
}

type RevisionItem = {
  id: number
  version: number
  title: string
  status: ContentStatus
  createdAt: string
}

type TaxonomyItem = {
  id: number
  name: string
  slug: string
  description?: string | null
}

type ContentAdminSection = 'blog' | 'categories' | 'tags'
type ContentAdminPageProps = {
  section?: ContentAdminSection
  embedded?: boolean
}

export const ContentAdminPage: React.FC<ContentAdminPageProps> = ({ section, embedded = false }) => {
  const { t } = useTranslation()
  const token = useAppSelector((s) => s.auth.token)
  const [items, setItems] = useState<AdminContentItem[]>([])
  const [statusFilter, setStatusFilter] = useState<'' | ContentStatus>('')
  const [typeFilter, setTypeFilter] = useState<'' | ContentType>('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [newType, setNewType] = useState<ContentType>('BLOG_POST')
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newExcerpt, setNewExcerpt] = useState('')
  const [creating, setCreating] = useState(false)
  const [openCreateContentModal, setOpenCreateContentModal] = useState(false)
  const [activeRevisionSlug, setActiveRevisionSlug] = useState<string | null>(null)
  const [revisions, setRevisions] = useState<RevisionItem[]>([])

  const [categoryName, setCategoryName] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null)
  const [categoryDraft, setCategoryDraft] = useState<{ name: string; slug: string; description: string } | null>(
    null,
  )
  const [tagName, setTagName] = useState('')
  const [tagSlug, setTagSlug] = useState('')
  const [tagDescription, setTagDescription] = useState('')
  const [editingTagSlug, setEditingTagSlug] = useState<string | null>(null)
  const [tagDraft, setTagDraft] = useState<{ name: string; slug: string; description: string } | null>(null)
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [tags, setTags] = useState<TaxonomyItem[]>([])
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false)
  const [openCreateTagModal, setOpenCreateTagModal] = useState(false)

  const showBlog = !section || section === 'blog'
  const showCategories = section === 'categories'
  const showTags = section === 'tags'

  const getTypeLabel = (type: ContentType) => {
    if (type === 'BLOG_POST') return t('content.admin.type.blogPost', 'BLOG_POST')
    if (type === 'DOC_PAGE') return t('content.admin.type.docPage', 'DOC_PAGE')
    return t('content.admin.type.helpArticle', 'HELP_ARTICLE')
  }

  const getStatusLabel = (statusValue: ContentStatus) => {
    if (statusValue === 'DRAFT') return t('content.admin.status.draft', 'DRAFT')
    if (statusValue === 'SCHEDULED') return t('content.admin.status.scheduled', 'SCHEDULED')
    if (statusValue === 'PUBLISHED') return t('content.admin.status.published', 'PUBLISHED')
    return t('content.admin.status.archived', 'ARCHIVED')
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (query) params.set('q', query)
      params.set('limit', '50')
      params.set('offset', '0')
      const res = await apiFetch<AdminContentItem[] | ApiEnvelope<AdminContentItem[]>>(
        `/content?${params.toString()}`,
        {
          method: 'GET',
          token: token ?? undefined,
        },
      )
      setItems(unwrapApiData(res))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.load', 'Failed to load content'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [statusFilter, typeFilter, query])

  const loadCategoriesAdmin = async () => {
    const res = await apiFetch<TaxonomyItem[] | ApiEnvelope<TaxonomyItem[]>>('/content/categories', {
      method: 'GET',
      token: token ?? undefined,
    })
    setCategories(unwrapApiData(res))
  }

  const loadTagsAdmin = async () => {
    const res = await apiFetch<TaxonomyItem[] | ApiEnvelope<TaxonomyItem[]>>('/content/tags', {
      method: 'GET',
      token: token ?? undefined,
    })
    setTags(unwrapApiData(res))
  }

  useEffect(() => {
    const loadTaxonomies = async () => {
      if (!showCategories && !showTags) return
      try {
        if (showCategories) await loadCategoriesAdmin()
        if (showTags) await loadTagsAdmin()
      } catch (e) {
        setError(
          e instanceof Error ? e.message : t('content.admin.errors.load', 'Failed to load content'),
        )
      }
    }
    void loadTaxonomies()
  }, [showCategories, showTags, t, token])

  const createContent = async () => {
    setCreating(true)
    setError(null)
    try {
      await apiFetch('/content', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          type: newType,
          title: newTitle,
          slug: newSlug,
          excerpt: newExcerpt || undefined,
          content: newContent,
        },
      })
      setNewTitle('')
      setNewSlug('')
      setNewExcerpt('')
      setNewContent('')
      setOpenCreateContentModal(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.create', 'Failed to create content'))
    } finally {
      setCreating(false)
    }
  }

  const updateStatus = async (slug: string, status: ContentStatus) => {
    try {
      await apiFetch(`/content/${slug}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: { status },
      })
      await load()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t('content.admin.errors.updateStatus', 'Failed to update status'),
      )
    }
  }

  const softDelete = async (slug: string) => {
    try {
      await apiFetch(`/content/${slug}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.delete', 'Failed to delete content'))
    }
  }

  const createCategory = async () => {
    try {
      await apiFetch('/content/categories', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: categoryName,
          slug: categorySlug,
          description: categoryDescription || undefined,
        },
      })
      setCategoryName('')
      setCategorySlug('')
      setCategoryDescription('')
      setOpenCreateCategoryModal(false)
      await loadCategoriesAdmin()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t('content.admin.errors.createCategory', 'Failed to create category'),
      )
    }
  }

  const startEditCategory = (category: TaxonomyItem) => {
    setEditingCategorySlug(category.slug)
    setCategoryDraft({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
    })
  }

  const saveCategory = async (slug: string) => {
    if (!categoryDraft) return
    try {
      await apiFetch(`/content/categories/${slug}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: categoryDraft.name,
          slug: categoryDraft.slug,
          description: categoryDraft.description || null,
        },
      })
      setEditingCategorySlug(null)
      setCategoryDraft(null)
      await loadCategoriesAdmin()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.createCategory', 'Failed to save category'))
    }
  }

  const deleteCategory = async (slug: string) => {
    try {
      await apiFetch(`/content/categories/${slug}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })
      await loadCategoriesAdmin()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t('content.admin.errors.createCategory', 'Failed to delete category'),
      )
    }
  }

  const createTag = async () => {
    try {
      await apiFetch('/content/tags', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: tagName,
          slug: tagSlug,
          description: tagDescription || undefined,
        },
      })
      setTagName('')
      setTagSlug('')
      setTagDescription('')
      setOpenCreateTagModal(false)
      await loadTagsAdmin()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.createTag', 'Failed to create tag'))
    }
  }

  const startEditTag = (tag: TaxonomyItem) => {
    setEditingTagSlug(tag.slug)
    setTagDraft({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? '',
    })
  }

  const saveTag = async (slug: string) => {
    if (!tagDraft) return
    try {
      await apiFetch(`/content/tags/${slug}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: tagDraft.name,
          slug: tagDraft.slug,
          description: tagDraft.description || null,
        },
      })
      setEditingTagSlug(null)
      setTagDraft(null)
      await loadTagsAdmin()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.createTag', 'Failed to save tag'))
    }
  }

  const deleteTag = async (slug: string) => {
    try {
      await apiFetch(`/content/tags/${slug}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })
      await loadTagsAdmin()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('content.admin.errors.createTag', 'Failed to delete tag'))
    }
  }

  const createPreviewToken = async (slug: string) => {
    try {
      const res = await apiFetch<
        { preview_token: string; preview_url: string; expires_at: string } | ApiEnvelope<{ preview_token: string; preview_url: string; expires_at: string }>
      >(
        `/content/${slug}/preview-token`,
        {
          method: 'POST',
          token: token ?? undefined,
          body: { expires_in_minutes: 30 },
        },
      )
      const data = unwrapApiData(res)
      window.alert(
        t('content.admin.alerts.previewUrl', 'Preview URL: {{url}}', {
          url: data.preview_url,
        }),
      )
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t('content.admin.errors.createPreviewToken', 'Failed to create preview token'),
      )
    }
  }

  const openRevisions = async (slug: string) => {
    try {
      const res = await apiFetch<RevisionItem[] | ApiEnvelope<RevisionItem[]>>(
        `/content/${slug}/revisions`,
        {
          method: 'GET',
          token: token ?? undefined,
        },
      )
      setActiveRevisionSlug(slug)
      setRevisions(unwrapApiData(res))
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t('content.admin.errors.loadRevisions', 'Failed to load revisions'),
      )
    }
  }

  const restoreRevision = async (slug: string, revisionId: number) => {
    try {
      await apiFetch(`/content/${slug}/revisions/${revisionId}/restore`, {
        method: 'POST',
        token: token ?? undefined,
      })
      await load()
      await openRevisions(slug)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t('content.admin.errors.restoreRevision', 'Failed to restore revision'),
      )
    }
  }

  const pageTitle = showBlog
    ? t('content.admin.title', 'Content Admin')
    : showCategories
      ? t('admin.nav.categories', 'Categories')
      : t('admin.nav.tags', 'Tags')
  const pageSubtitle = showBlog
    ? t('content.admin.subtitle', 'Manage blog/docs/help content from backend CMS.')
    : showCategories
      ? t('content.admin.category.title', 'Create Category')
      : t('content.admin.tag.title', 'Create Tag')

  const content = (
    <section className={[embedded ? 'w-full' : 'max-w-6xl mx-auto', 'space-y-6'].join(' ')}>
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-500">
            {pageSubtitle}
          </p>
        </div>

        {showBlog && (
        <Card>
          <CardHeader className="px-6">
            <h3 className="font-semibold text-slate-900">{t('content.admin.filters.title', 'Filters')}</h3>
          </CardHeader>
          <CardBody className="px-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('content.admin.filters.searchPlaceholder', 'Search by title / slug')}
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as '' | ContentType)}
            >
              <option value="">{t('content.admin.filters.allTypes', 'All types')}</option>
              <option value="BLOG_POST">{t('content.admin.type.blogPost', 'BLOG_POST')}</option>
              <option value="DOC_PAGE">{t('content.admin.type.docPage', 'DOC_PAGE')}</option>
              <option value="HELP_ARTICLE">{t('content.admin.type.helpArticle', 'HELP_ARTICLE')}</option>
            </select>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | ContentStatus)}
            >
              <option value="">{t('content.admin.filters.allStatus', 'All status')}</option>
              <option value="DRAFT">{t('content.admin.status.draft', 'DRAFT')}</option>
              <option value="SCHEDULED">{t('content.admin.status.scheduled', 'SCHEDULED')}</option>
              <option value="PUBLISHED">{t('content.admin.status.published', 'PUBLISHED')}</option>
              <option value="ARCHIVED">{t('content.admin.status.archived', 'ARCHIVED')}</option>
            </select>
            <Button variant="secondary" onClick={() => void load()}>
              {t('content.admin.actions.refresh', 'Refresh')}
            </Button>
          </CardBody>
        </Card>
        )}

        {showBlog && (
          <div className="flex justify-end">
            <Button onClick={() => setOpenCreateContentModal(true)}>
              {t('content.admin.create.submit', 'Create')}
            </Button>
          </div>
        )}

        {(showCategories || showTags) && (
        <div className="grid grid-cols-1 gap-4">
          {showCategories && (
          <Card>
            <CardHeader className="px-6">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-900">
                  {t('admin.nav.categories', 'Categories')}
                </h4>
                <Button size="sm" onClick={() => setOpenCreateCategoryModal(true)}>
                  {t('content.admin.category.submit', 'Save category')}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="px-6 space-y-1">
              {showCategories && (
                <div className="space-y-1 pt-2">
                  {categories.map((c) => (
                    <div key={c.id} className="text-xs border border-slate-100 rounded px-2 py-2">
                      {editingCategorySlug === c.slug && categoryDraft ? (
                        <div className="space-y-2">
                          <Input
                            value={categoryDraft.name}
                            onChange={(e) =>
                              setCategoryDraft((d) => (d ? { ...d, name: e.target.value } : d))
                            }
                          />
                          <Input
                            value={categoryDraft.slug}
                            onChange={(e) =>
                              setCategoryDraft((d) => (d ? { ...d, slug: e.target.value } : d))
                            }
                          />
                          <Input
                            value={categoryDraft.description}
                            onChange={(e) =>
                              setCategoryDraft((d) => (d ? { ...d, description: e.target.value } : d))
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => void saveCategory(c.slug)}>
                              {t('admin.actions.save', 'Save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCategorySlug(null)
                                setCategoryDraft(null)
                              }}
                            >
                              {t('admin.actions.cancel', 'Cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold">{c.name}</span> ({c.slug})
                            {c.description ? <p className="text-[11px] text-slate-500">{c.description}</p> : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => startEditCategory(c)}>
                              {t('admin.actions.edit', 'Edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => void deleteCategory(c.slug)}
                            >
                              {t('content.admin.actions.delete', 'Delete')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}
          {showTags && (
          <Card>
            <CardHeader className="px-6">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-900">{t('admin.nav.tags', 'Tags')}</h4>
                <Button size="sm" onClick={() => setOpenCreateTagModal(true)}>
                  {t('content.admin.tag.submit', 'Save tag')}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="px-6 space-y-1">
              {showTags && (
                <div className="space-y-1 pt-2">
                  {tags.map((c) => (
                    <div key={c.id} className="text-xs border border-slate-100 rounded px-2 py-2">
                      {editingTagSlug === c.slug && tagDraft ? (
                        <div className="space-y-2">
                          <Input
                            value={tagDraft.name}
                            onChange={(e) => setTagDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                          />
                          <Input
                            value={tagDraft.slug}
                            onChange={(e) => setTagDraft((d) => (d ? { ...d, slug: e.target.value } : d))}
                          />
                          <Input
                            value={tagDraft.description}
                            onChange={(e) =>
                              setTagDraft((d) => (d ? { ...d, description: e.target.value } : d))
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => void saveTag(c.slug)}>
                              {t('admin.actions.save', 'Save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTagSlug(null)
                                setTagDraft(null)
                              }}
                            >
                              {t('admin.actions.cancel', 'Cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold">{c.name}</span> ({c.slug})
                            {c.description ? <p className="text-[11px] text-slate-500">{c.description}</p> : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => startEditTag(c)}>
                              {t('admin.actions.edit', 'Edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => void deleteTag(c.slug)}
                            >
                              {t('content.admin.actions.delete', 'Delete')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          )}
        </div>
        )}

        {showBlog && (
        <Card className="overflow-hidden">
          <Table>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  {t('content.admin.table.type', 'Type')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  {t('content.admin.table.title', 'Title')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  {t('content.admin.table.status', 'Status')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                  {t('content.admin.table.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                    {t('content.admin.loading', 'Loading...')}
                  </td>
                </tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-xs text-slate-600">{getTypeLabel(item.type)}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-xs">{getStatusLabel(item.status)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => void createPreviewToken(item.slug)}>
                        {t('content.admin.actions.preview', 'Preview')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => void openRevisions(item.slug)}>
                        {t('content.admin.actions.revisions', 'Revisions')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => void updateStatus(item.slug, 'PUBLISHED')}>
                        {t('content.admin.actions.publish', 'Publish')}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => void softDelete(item.slug)}>
                        {t('content.admin.actions.delete', 'Delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        )}

        {showBlog && activeRevisionSlug && (
          <Card>
            <CardHeader className="px-6">
              <h3 className="font-semibold text-slate-900">
                {t('content.admin.revisions.title', 'Revisions')} - {activeRevisionSlug}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveRevisionSlug(null)}>
                {t('content.admin.actions.close', 'Close')}
              </Button>
            </CardHeader>
            <CardBody className="px-6">
              <div className="space-y-2">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="rounded-lg border border-slate-200 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        v{revision.version} - {revision.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getStatusLabel(revision.status)} - {new Date(revision.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void restoreRevision(activeRevisionSlug, revision.id)}
                    >
                      {t('content.admin.actions.restore', 'Restore')}
                    </Button>
                  </div>
                ))}
                {revisions.length === 0 && (
                  <p className="text-sm text-slate-500">
                    {t('content.admin.revisions.empty', 'No revisions found.')}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        <AdminModal
          open={openCreateContentModal}
          title={t('content.admin.modal.createContent.title', 'Create content')}
          subtitle={t('content.admin.modal.createContent.subtitle', 'Create new blog/docs/help content item.')}
          onClose={() => setOpenCreateContentModal(false)}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value as ContentType)}
              >
                <option value="BLOG_POST">{t('content.admin.type.blogPost', 'BLOG_POST')}</option>
                <option value="DOC_PAGE">{t('content.admin.type.docPage', 'DOC_PAGE')}</option>
                <option value="HELP_ARTICLE">{t('content.admin.type.helpArticle', 'HELP_ARTICLE')}</option>
              </select>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('content.admin.create.titlePlaceholder', 'Title')}
              />
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder={t('content.admin.create.slugPlaceholder', 'Slug')}
              />
            </div>
            <Input
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              placeholder={t('content.admin.create.excerptPlaceholder', 'Excerpt (optional)')}
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t('content.admin.create.bodyPlaceholder', 'Content body')}
              className="w-full min-h-32 rounded-lg border border-slate-200 p-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenCreateContentModal(false)}>
                {t('admin.modal.actions.cancel', 'Cancel')}
              </Button>
              <Button
                loading={creating}
                disabled={!newTitle.trim() || !newSlug.trim() || !newContent.trim()}
                onClick={createContent}
              >
                {t('admin.modal.actions.create', 'Create')}
              </Button>
            </div>
          </div>
        </AdminModal>

        <AdminModal
          open={openCreateCategoryModal}
          title={t('content.admin.modal.createCategory.title', 'Create category')}
          subtitle={t('content.admin.modal.createCategory.subtitle', 'Create a new content category.')}
          onClose={() => setOpenCreateCategoryModal(false)}
        >
          <div className="space-y-3">
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={t('content.admin.category.namePlaceholder', 'Category name')}
            />
            <Input
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              placeholder={t('content.admin.category.slugPlaceholder', 'Category slug')}
            />
            <Input
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder={t('content.admin.category.descriptionPlaceholder', 'Description (optional)')}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenCreateCategoryModal(false)}>
                {t('admin.modal.actions.cancel', 'Cancel')}
              </Button>
              <Button onClick={createCategory} disabled={!categoryName.trim() || !categorySlug.trim()}>
                {t('admin.modal.actions.create', 'Create')}
              </Button>
            </div>
          </div>
        </AdminModal>

        <AdminModal
          open={openCreateTagModal}
          title={t('content.admin.modal.createTag.title', 'Create tag')}
          subtitle={t('content.admin.modal.createTag.subtitle', 'Create a new content tag.')}
          onClose={() => setOpenCreateTagModal(false)}
        >
          <div className="space-y-3">
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={t('content.admin.tag.namePlaceholder', 'Tag name')}
            />
            <Input
              value={tagSlug}
              onChange={(e) => setTagSlug(e.target.value)}
              placeholder={t('content.admin.tag.slugPlaceholder', 'Tag slug')}
            />
            <Input
              value={tagDescription}
              onChange={(e) => setTagDescription(e.target.value)}
              placeholder={t('content.admin.tag.descriptionPlaceholder', 'Description (optional)')}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenCreateTagModal(false)}>
                {t('admin.modal.actions.cancel', 'Cancel')}
              </Button>
              <Button onClick={createTag} disabled={!tagName.trim() || !tagSlug.trim()}>
                {t('admin.modal.actions.create', 'Create')}
              </Button>
            </div>
          </div>
        </AdminModal>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</div>
        )}
      </section>
  )

  if (embedded) return content
  return (
    <AuthenticatedLayout>
      {content}
    </AuthenticatedLayout>
  )
}
