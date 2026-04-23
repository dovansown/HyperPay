import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type ChartDataPoint = {
  date: string;
  revenue: number;
  label: string;
};

export type RecentTransaction = {
  id: string;
  amount: number;
  type: string;
  description: string;
  occurred_at: string;
};

export type DashboardResult = {
  total_accounts: number;
  total_balance_vnd: number;
  today_revenue_vnd: number;
  chart_data: ChartDataPoint[];
  recent_transactions: RecentTransaction[];
};

type DashboardState = {
  data: DashboardResult | null;
  period: 7 | 30;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: DashboardState = {
  data: null,
  period: 7,
  status: 'idle',
  error: null,
};

export const fetchDashboard = createAsyncThunk<DashboardResult, { period: 7 | 30 }, { state: RootState }>(
  'dashboard/fetch',
  async ({ period }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<DashboardResult | ApiEnvelope<DashboardResult>>(`/dashboard?period=${period}`, {
      method: 'GET',
      token,
    });
    return unwrapApiData(res);
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setPeriod(state, action: { payload: 7 | 30 }) {
      state.period = action.payload;
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load dashboard';
      });
  },
});

export const { setPeriod, clearDashboardError } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;

