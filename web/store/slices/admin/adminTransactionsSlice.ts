import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface Transaction {
  id: string;
  external_id: string;
  type: string;
  amount: number;
  balance: number | null;
  payment_code: string | null;
  description: string;
  occurred_at: string;
  bank_account: {
    id: string;
    bank_name: string;
    account_number: string;
  };
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

interface AdminTransactionsState {
  transactions: {
    items: Transaction[];
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
  tx_type?: 'IN' | 'OUT';
  user_id?: string;
  from?: string;
  to?: string;
}

const initialState: AdminTransactionsState = {
  transactions: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminTransactions = createAsyncThunk(
  'adminTransactions/fetchTransactions',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.tx_type) params.append('tx_type', query.tx_type);
    if (query.user_id) params.append('user_id', query.user_id);
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await apiFetch<{
      items: Transaction[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: Transaction[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/transactions?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

// Slice
const adminTransactionsSlice = createSlice({
  name: 'adminTransactions',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload as any;
      })
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });
  },
});

export const { clearError } = adminTransactionsSlice.actions;
export const adminTransactionsReducer = adminTransactionsSlice.reducer;
