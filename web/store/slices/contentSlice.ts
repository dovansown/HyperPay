import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, type ApiEnvelope } from '@/lib/apiClient';

export type ContentType = 'BLOG_POST' | 'DOC_PAGE' | 'HELP_PAGE';

export type PublicContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  scheduled_publish_at?: string | null;
  created_at?: string;
  updated_at?: string;
  category_slugs?: string[];
  tag_slugs?: string[];
};

type PublicListMeta = { total?: number; limit?: number; offset?: number };

type ContentState = {
  list: PublicContentItem[];
  listMeta: PublicListMeta;
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
  bySlug: Record<string, PublicContentItem | undefined>;
  itemStatusBySlug: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed' | undefined>;
  itemErrorBySlug: Record<string, string | null | undefined>;
};

const initialState: ContentState = {
  list: [],
  listMeta: {},
  listStatus: 'idle',
  listError: null,
  bySlug: {},
  itemStatusBySlug: {},
  itemErrorBySlug: {},
};

export const fetchPublicContentList = createAsyncThunk<
  { items: PublicContentItem[]; meta: PublicListMeta },
  { type: ContentType; limit?: number; offset?: number; category?: string; tag?: string; q?: string }
>('content/fetchPublicList', async ({ type, limit = 20, offset = 0, category, tag, q }) => {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  if (q) params.set('q', q);

  const res = await apiFetch<ApiEnvelope<PublicContentItem[]>>(`/public/content?${params.toString()}`, { method: 'GET' });
  return { items: res.data ?? [], meta: (res.meta ?? {}) as PublicListMeta };
});

export const fetchPublicContentBySlug = createAsyncThunk<PublicContentItem, { slug: string }>(
  'content/fetchPublicBySlug',
  async ({ slug }) => {
    const res = await apiFetch<ApiEnvelope<PublicContentItem> | PublicContentItem>(`/public/content/${slug}`, { method: 'GET' });
    // endpoint get-by-slug trả envelope trong đa số case
    const item = (res && typeof res === 'object' && 'data' in res ? (res as ApiEnvelope<PublicContentItem>).data : res) as PublicContentItem;
    return item;
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearContentListError(state) {
      state.listError = null;
    },
    clearContentItemError(state, action: { payload: string }) {
      state.itemErrorBySlug[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicContentList.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchPublicContentList.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload.items;
        state.listMeta = action.payload.meta;
      })
      .addCase(fetchPublicContentList.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.error.message ?? 'Failed to load content list';
      })
      .addCase(fetchPublicContentBySlug.pending, (state, action) => {
        const slug = action.meta.arg.slug;
        state.itemStatusBySlug[slug] = 'loading';
        state.itemErrorBySlug[slug] = null;
      })
      .addCase(fetchPublicContentBySlug.fulfilled, (state, action) => {
        const slug = action.payload.slug;
        state.bySlug[slug] = action.payload;
        state.itemStatusBySlug[slug] = 'succeeded';
      })
      .addCase(fetchPublicContentBySlug.rejected, (state, action) => {
        const slug = action.meta.arg.slug;
        state.itemStatusBySlug[slug] = 'failed';
        state.itemErrorBySlug[slug] = action.error.message ?? 'Failed to load content';
      });
  },
});

export const { clearContentListError, clearContentItemError } = contentSlice.actions;
export const contentReducer = contentSlice.reducer;

