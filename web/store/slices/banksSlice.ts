import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type BankItem = {
  id: string;
  name: string;
  code: string;
  icon_url?: string | null;
};

type BanksState = {
  items: BankItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: BanksState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchBanks = createAsyncThunk<BankItem[], void, { state: RootState }>('banks/fetch', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined;
  const res = await apiFetch<BankItem[] | ApiEnvelope<BankItem[]>>('/banks', { method: 'GET', token });
  const data = unwrapApiData(res);
  return Array.isArray(data) ? data : [];
});

const banksSlice = createSlice({
  name: 'banks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load banks';
      });
  },
});

export const banksReducer = banksSlice.reducer;

