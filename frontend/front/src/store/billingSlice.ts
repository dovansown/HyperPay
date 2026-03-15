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

export type PackageBankItem = {
  bank_id: string
  name: string
  code: string
  account_limit: number
}

export type PackagePricingItem = {
  duration_id: string
  duration_name: string
  months: number
  days: number
  price_vnd: number
  is_default?: boolean
  discount_percent?: number | null
}

export type PackageItem = {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  is_default: boolean
  apply_default_discount?: boolean
  default_start_at: string | null
  default_end_at: string | null
  price_vnd: number
  max_transactions: number | null
  max_webhook_deliveries: number | null
  max_bank_types: number | null
  is_unlimited_transactions: boolean
  is_unlimited_webhook_deliveries: boolean
  is_unlimited_bank_types: boolean
  duration_days: number | null
  description: string
  bank_ids: string[]
  banks?: PackageBankItem[]
  pricing?: PackagePricingItem[]
}

type ActivePackage = {
  id: string
  package_id: string
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
  activePackages: ActivePackage[]
  balanceVnd: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  purchaseStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  topUpStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: BillingState = {
  plans: [],
  packages: [],
  activePackages: [],
  balanceVnd: 0,
  status: 'idle',
  purchaseStatus: 'idle',
  topUpStatus: 'idle',
  error: null,
}

export const fetchBillingData = createAsyncThunk<
  {
    plans: PlanItem[]
    packages: PackageItem[]
    activePackages: ActivePackage[]
    balanceVnd: number
  },
  void,
  { state: RootState }
>('billing/fetchData', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const [plansRes, packagesRes, activeRes, balanceRes] = await Promise.all([
    apiFetch<PlanItem[] | ApiEnvelope<PlanItem[]>>('/plans', { method: 'GET', token }),
    apiFetch<PackageItem[] | ApiEnvelope<PackageItem[]>>('/packages', { method: 'GET', token }),
    apiFetch<ActivePackage[] | ApiEnvelope<ActivePackage[]>>('/packages/me/active', {
      method: 'GET',
      token,
    }),
    apiFetch<{ balance_vnd: number } | ApiEnvelope<{ balance_vnd: number }>>('/balance', {
      method: 'GET',
      token,
    }),
  ])
  const activeData = unwrapApiData(activeRes)
  const activePackages = Array.isArray(activeData) ? activeData : activeData ? [activeData] : []
  const balancePayload = unwrapApiData(balanceRes)
  const balanceVnd = balancePayload && typeof balancePayload === 'object' && 'balance_vnd' in balancePayload
    ? (balancePayload as { balance_vnd: number }).balance_vnd
    : 0
  return {
    plans: unwrapApiData(plansRes),
    packages: unwrapApiData(packagesRes),
    activePackages,
    balanceVnd,
  }
})

export const purchasePackage = createAsyncThunk<
  ActivePackage,
  { packageId: number; durationId: number },
  { state: RootState }
>(
  'billing/purchasePackage',
  async ({ packageId, durationId }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined
    const res = await apiFetch<ActivePackage | ApiEnvelope<ActivePackage>>(
      `/packages/${packageId}/purchase`,
      {
        method: 'POST',
        token,
        body: { duration_id: durationId },
      },
    )
    return unwrapApiData(res)
  },
)

export const topUpBalance = createAsyncThunk<number, number, { state: RootState }>(
  'billing/topUpBalance',
  async (amountVnd, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined
    const res = await apiFetch<{ balance_vnd: number } | ApiEnvelope<{ balance_vnd: number }>>(
      '/balance/top-up',
      {
        method: 'POST',
        token,
        body: { amount_vnd: amountVnd },
      },
    )
    const payload = unwrapApiData(res)
    return payload && typeof payload === 'object' && 'balance_vnd' in payload
      ? (payload as { balance_vnd: number }).balance_vnd
      : amountVnd
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
        state.activePackages = action.payload.activePackages
        state.balanceVnd = action.payload.balanceVnd
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
        state.activePackages.push(action.payload)
      })
      .addCase(topUpBalance.pending, (state) => {
        state.topUpStatus = 'loading'
        state.error = null
      })
      .addCase(topUpBalance.fulfilled, (state, action) => {
        state.topUpStatus = 'succeeded'
        state.balanceVnd = action.payload
      })
      .addCase(topUpBalance.rejected, (state, action) => {
        state.topUpStatus = 'failed'
        state.error = action.error.message ?? 'Failed to top up'
      })
      .addCase(purchasePackage.rejected, (state, action) => {
        state.purchaseStatus = 'failed'
        state.error = action.error.message ?? 'Failed to purchase package'
      })
  },
})

export const billingReducer = billingSlice.reducer
