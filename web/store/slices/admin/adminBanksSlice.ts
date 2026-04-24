import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface Bank {
  id: string;
  name: string;
  code: string;
  icon_url: string | null;
  created_at: string;
}

interface AdminBanksState {
  banks: {
    items: Bank[];
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
  code?: string;
}

interface CreateBankInput {
  name: string;
  code: string;
  icon_url?: string;
}

interface UpdateBankInput extends Partial<CreateBankInput> {}

const initialState: AdminBanksState = {
  banks: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminBanks = createAsyncThunk(
  'adminBanks/fetchBanks',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.code) params.append('code', query.code);

    const response = await apiFetch<{
      items: Bank[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: Bank[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/banks?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

export const createBank = createAsyncThunk(
  'adminBanks/createBank',
  async (data: CreateBankInput, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Bank | ApiEnvelope<Bank>>('/admin/banks', {
      method: 'POST',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const updateBank = createAsyncThunk(
  'adminBanks/updateBank',
  async ({ id, data }: { id: string; data: UpdateBankInput }, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Bank | ApiEnvelope<Bank>>(`/admin/banks/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

// Slice
const adminBanksSlice = createSlice({
  name: 'adminBanks',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banks
      .addCase(fetchAdminBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload as any;
      })
      .addCase(fetchAdminBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch banks';
      })
      // Create Bank
      .addCase(createBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.loading = false;
        const bankData = action.payload as any;
        state.banks.items.unshift(bankData);
        state.banks.total += 1;
      })
      .addCase(createBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create bank';
      })
      // Update Bank
      .addCase(updateBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        state.loading = false;
        const bankData = action.payload as any;
        const index = state.banks.items.findIndex((b) => b.id === bankData.id);
        if (index !== -1) {
          state.banks.items[index] = bankData;
        }
      })
      .addCase(updateBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update bank';
      });
  },
});

export const { clearError } = adminBanksSlice.actions;
export const adminBanksReducer = adminBanksSlice.reducer;
