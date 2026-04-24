import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface Webhook {
  id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  url: string;
  auth_type: string;
  content_type: string;
  transaction_direction: string;
  is_active: boolean;
  account_ids: string[];
  created_at: string;
}

interface AdminWebhooksState {
  webhooks: {
    items: Webhook[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

interface AdminListQuery {
  limit?: number;
  offset?: number;
  q?: string;
  user_id?: string;
  auth_type?: string;
  is_active?: boolean;
}

const initialState: AdminWebhooksState = {
  webhooks: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminWebhooks = createAsyncThunk(
  'adminWebhooks/fetchWebhooks',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.user_id) params.append('user_id', query.user_id);
    if (query.auth_type) params.append('auth_type', query.auth_type);
    if (query.is_active !== undefined) params.append('is_active', query.is_active.toString());

    const response = await apiFetch<{
      items: Webhook[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: Webhook[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/webhooks?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

// Slice
const adminWebhooksSlice = createSlice({
  name: 'adminWebhooks',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Webhooks
      .addCase(fetchAdminWebhooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminWebhooks.fulfilled, (state, action) => {
        state.loading = false;
        state.webhooks = action.payload as any;
      })
      .addCase(fetchAdminWebhooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch webhooks';
      });
  },
});

export const { clearError } = adminWebhooksSlice.actions;
export const adminWebhooksReducer = adminWebhooksSlice.reducer;
