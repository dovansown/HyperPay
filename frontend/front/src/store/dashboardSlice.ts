import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

type Account = {
  id: number
  bank_name?: string
}

type Transaction = {
  id?: number | string
  amount?: number
  type?: string
  occurred_at?: string
  description?: string
}

type DashboardState = {
  totalAccounts: number
  totalPlans: number
  totalBanks: number
  recentTransactions: Transaction[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  totalAccounts: 0,
  totalPlans: 0,
  totalBanks: 0,
  recentTransactions: [],
  status: 'idle',
  error: null,
}

export const fetchDashboardData = createAsyncThunk<
  DashboardState,
  void,
  { state: RootState }
>('dashboard/fetch', async (_, thunkApi) => {
  const state = thunkApi.getState()
  const token = state.auth.token ?? undefined

  const [accounts, plans, banks] = await Promise.all([
    apiFetch<Account[] | ApiEnvelope<Account[]>>('/accounts', { method: 'GET', token }),
    apiFetch<unknown[] | ApiEnvelope<unknown[]>>('/plans', { method: 'GET', token }),
    apiFetch<unknown[] | ApiEnvelope<unknown[]>>('/banks', { method: 'GET', token }),
  ])

  const accountList = unwrapApiData<Account[]>(accounts)
  const planList = unwrapApiData<unknown[]>(plans)
  const bankList = unwrapApiData<unknown[]>(banks)

  let recentTransactions: Transaction[] = []
  if (accountList.length > 0) {
    const firstAccountId = accountList[0]?.id
    if (firstAccountId != null) {
      try {
        const txResponse = await apiFetch<Transaction[] | ApiEnvelope<Transaction[]>>(
          `/accounts/${firstAccountId}/transactions`,
          { method: 'GET', token },
        )
        recentTransactions = unwrapApiData<Transaction[]>(txResponse)
      } catch {
        recentTransactions = []
      }
    }
  }

  return {
    totalAccounts: accountList.length,
    totalPlans: planList.length,
    totalBanks: bankList.length,
    recentTransactions,
    status: 'succeeded',
    error: null,
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.totalAccounts = action.payload.totalAccounts
        state.totalPlans = action.payload.totalPlans
        state.totalBanks = action.payload.totalBanks
        state.recentTransactions = action.payload.recentTransactions
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load dashboard data'
      })
  },
})

export const dashboardReducer = dashboardSlice.reducer

