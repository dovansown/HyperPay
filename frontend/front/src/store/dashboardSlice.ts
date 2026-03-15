import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

export type ChartDataPoint = {
  date: string
  revenue: number
  label: string
}

type Transaction = {
  id?: number | string
  amount?: number
  type?: string
  occurred_at?: string
  description?: string
}

type DashboardApiResponse = {
  total_accounts: number
  total_plans: number
  total_balance_vnd: number
  today_revenue_vnd: number
  chart_data: ChartDataPoint[]
  recent_transactions: Transaction[]
}

type DashboardState = {
  totalAccounts: number
  totalPlans: number
  totalBalanceVnd: number
  todayRevenueVnd: number
  chartData: ChartDataPoint[]
  chartPeriod: 7 | 30
  recentTransactions: Transaction[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  totalAccounts: 0,
  totalPlans: 0,
  totalBalanceVnd: 0,
  todayRevenueVnd: 0,
  chartData: [],
  chartPeriod: 7,
  recentTransactions: [],
  status: 'idle',
  error: null,
}

export const fetchDashboardData = createAsyncThunk<
  DashboardApiResponse,
  { period?: 7 | 30 },
  { state: RootState }
>('dashboard/fetch', async ({ period = 7 }, thunkApi) => {
  const state = thunkApi.getState()
  const token = state.auth.token ?? undefined
  const res = await apiFetch<DashboardApiResponse | ApiEnvelope<DashboardApiResponse>>(
    `/dashboard?period=${period}`,
    { method: 'GET', token },
  )
  return unwrapApiData<DashboardApiResponse>(res)
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setChartPeriod(state, action: { payload: 7 | 30 }) {
      state.chartPeriod = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.totalAccounts = action.payload.total_accounts
        state.totalPlans = action.payload.total_plans
        state.totalBalanceVnd = action.payload.total_balance_vnd
        state.todayRevenueVnd = action.payload.today_revenue_vnd
        state.chartData = action.payload.chart_data
        state.recentTransactions = action.payload.recent_transactions
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load dashboard data'
      })
  },
})

export const { setChartPeriod } = dashboardSlice.actions
export const dashboardReducer = dashboardSlice.reducer
