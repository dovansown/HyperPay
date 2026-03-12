import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

type PlanItem = {
  id: number
  name: string
  price_vnd: number
  max_bank_accounts: number
  max_transactions: number
  duration_days: number
  description: string
  bank_ids: number[]
}

export type PackageItem = {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  is_default: boolean
  default_start_at: string | null
  default_end_at: string | null
  price_vnd: number
  max_transactions: number | null
  max_webhook_deliveries: number | null
  max_bank_types: number | null
  is_unlimited_transactions: boolean
  is_unlimited_webhook_deliveries: boolean
  is_unlimited_bank_types: boolean
  duration_days: number
  description: string
  bank_ids: number[]
}

type ActivePackage = {
  id: number
  package_id: number
  status: string
  start_at: string
  end_at: string
  usage: {
    transactions: number
    webhook_deliveries: number
    bank_types: number
  }
  limits: {
    transactions: number | null
    webhook_deliveries: number | null
    bank_types: number | null
    is_unlimited_transactions: boolean
    is_unlimited_webhook_deliveries: boolean
    is_unlimited_bank_types: boolean
  }
  allowed_bank_ids: number[]
  package: PackageItem
}

type BillingState = {
  plans: PlanItem[]
  packages: PackageItem[]
  activePackage: ActivePackage | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  purchaseStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: BillingState = {
  plans: [],
  packages: [],
  activePackage: null,
  status: 'idle',
  purchaseStatus: 'idle',
  error: null,
}

export const fetchBillingData = createAsyncThunk<
  { plans: PlanItem[]; packages: PackageItem[]; activePackage: ActivePackage | null },
  void,
  { state: RootState }
>('billing/fetchData', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const [plansRes, packagesRes, activeRes] = await Promise.all([
    apiFetch<PlanItem[] | ApiEnvelope<PlanItem[]>>('/plans', { method: 'GET', token }),
    apiFetch<PackageItem[] | ApiEnvelope<PackageItem[]>>('/packages', { method: 'GET', token }),
    apiFetch<ActivePackage | null | ApiEnvelope<ActivePackage | null>>('/packages/me/active', {
      method: 'GET',
      token,
    }),
  ])
  return {
    plans: unwrapApiData(plansRes),
    packages: unwrapApiData(packagesRes),
    activePackage: unwrapApiData(activeRes),
  }
})

export const purchasePackage = createAsyncThunk<ActivePackage, number, { state: RootState }>(
  'billing/purchasePackage',
  async (packageId, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined
    const res = await apiFetch<ActivePackage | ApiEnvelope<ActivePackage>>(
      `/packages/${packageId}/purchase`,
      {
        method: 'POST',
        token,
      },
    )
    return unwrapApiData(res)
  },
)

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchBillingData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.plans = action.payload.plans
        state.packages = action.payload.packages
        state.activePackage = action.payload.activePackage
      })
      .addCase(fetchBillingData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load billing data'
      })
      .addCase(purchasePackage.pending, (state) => {
        state.purchaseStatus = 'loading'
        state.error = null
      })
      .addCase(purchasePackage.fulfilled, (state, action) => {
        state.purchaseStatus = 'succeeded'
        state.activePackage = action.payload
      })
      .addCase(purchasePackage.rejected, (state, action) => {
        state.purchaseStatus = 'failed'
        state.error = action.error.message ?? 'Failed to purchase package'
      })
  },
})

export const billingReducer = billingSlice.reducer
