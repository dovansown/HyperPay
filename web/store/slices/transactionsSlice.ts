import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type Transaction = {
  id: string;
  bank_account_id: string;
  type: 'IN' | 'OUT';
  amount: string;
  description: string | null;
  occurred_at: string;
  created_at: string;
};

type TransactionsState = {
  items: Transaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTransactionsByAccount = createAsyncThunk<
  Transaction[],
  string,
  { state: RootState }
>('transactions/fetchByAccount', async (accountId, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined;
  const res = await apiFetch<Transaction[] | ApiEnvelope<Transaction[]>>(
    `/accounts/${accountId}/transactions`,
    { method: 'GET', token }
  );
  const data = unwrapApiData(res);
  return Array.isArray(data) ? data : [];
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionsError(state) {
      state.error = null;
    },
    clearTransactions(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsByAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactionsByAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactionsByAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load transactions';
      });
  },
});

export const { clearTransactionsError, clearTransactions } = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
