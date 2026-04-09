import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type DurationItem = { id: string; name: string; months: number; days: number; sort_order: number };

export type PlanItem = {
  id: number;
  name: string;
  price_vnd: number;
  max_bank_accounts: number;
  max_transactions: number;
  duration_days: number;
  description?: string;
  bank_ids: number[];
};

export type PackageBankItem = {
  bank_id: number;
  name: string;
  code: string;
  account_limit: number;
};

export type PackagePricingItem = {
  duration_id: number;
  duration_name: string;
  months: number;
  days: number;
  price_vnd: number;
  is_default?: boolean;
  discount_percent?: number | null;
};

export type PackageItem = {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  is_default: boolean;
  apply_default_discount?: boolean;
  default_start_at: string | null;
  default_end_at: string | null;
  price_vnd: number;
  max_transactions: number | null;
  max_webhook_deliveries: number | null;
  max_bank_types: number | null;
  is_unlimited_transactions: boolean;
  is_unlimited_webhook_deliveries: boolean;
  is_unlimited_bank_types: boolean;
  duration_days: number | null;
  description: string;
  bank_ids: number[];
  banks?: PackageBankItem[];
  pricing?: PackagePricingItem[];
};

export type ActivePackage = {
  id: number;
  user_id: number;
  package_id: number;
  status: string;
  start_at: string;
  end_at: string;
  usage: {
    transactions: number;
    webhook_deliveries: number;
    bank_types: number;
  };
  limits: {
    transactions: number | null;
    webhook_deliveries: number | null;
    bank_types: number | null;
    is_unlimited_transactions: boolean;
    is_unlimited_webhook_deliveries: boolean;
    is_unlimited_bank_types: boolean;
  };
  allowed_bank_ids: number[];
  package: PackageItem;
};

type BillingState = {
  plans: PlanItem[];
  packages: PackageItem[];
  durations: DurationItem[];
  activePackages: ActivePackage[];
  balanceVnd: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  purchaseStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  topUpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: BillingState = {
  plans: [],
  packages: [],
  durations: [],
  activePackages: [],
  balanceVnd: 0,
  status: 'idle',
  purchaseStatus: 'idle',
  topUpStatus: 'idle',
  error: null,
};

export const fetchBillingData = createAsyncThunk<
  { plans: PlanItem[]; packages: PackageItem[]; durations: DurationItem[]; activePackages: ActivePackage[]; balanceVnd: number },
  void,
  { state: RootState }
>('billing/fetchAll', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined;
  const [plansRes, packagesRes, durationsRes, activeRes, balanceRes] = await Promise.all([
    apiFetch<PlanItem[] | ApiEnvelope<PlanItem[]>>('/plans', { method: 'GET', token }),
    apiFetch<PackageItem[] | ApiEnvelope<PackageItem[]>>('/packages', { method: 'GET', token }),
    apiFetch<DurationItem[] | ApiEnvelope<DurationItem[]>>('/durations', { method: 'GET', token }),
    apiFetch<ActivePackage[] | ApiEnvelope<ActivePackage[]>>('/packages/me/active', { method: 'GET', token }),
    apiFetch<{ balance_vnd: number } | ApiEnvelope<{ balance_vnd: number }>>('/balance', { method: 'GET', token }),
  ]);

  const plans = unwrapApiData(plansRes);
  const packages = unwrapApiData(packagesRes);
  const durations = unwrapApiData(durationsRes);
  const activePayload = unwrapApiData(activeRes);
  const activePackages = Array.isArray(activePayload) ? activePayload : activePayload ? [activePayload] : [];
  const bal = unwrapApiData(balanceRes);
  const balanceVnd = typeof bal?.balance_vnd === 'number' ? bal.balance_vnd : 0;

  return {
    plans: Array.isArray(plans) ? plans : [],
    packages: Array.isArray(packages) ? packages : [],
    durations: Array.isArray(durations) ? durations : [],
    activePackages,
    balanceVnd,
  };
});

export const topUpBalance = createAsyncThunk<number, { amountVnd: number }, { state: RootState }>(
  'billing/topUp',
  async ({ amountVnd }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<{ balance_vnd: number } | ApiEnvelope<{ balance_vnd: number }>, { amount_vnd: number }>(
      '/balance/top-up',
      { method: 'POST', token, body: { amount_vnd: amountVnd } }
    );
    const data = unwrapApiData(res);
    return data.balance_vnd;
  }
);

export const purchasePackage = createAsyncThunk<ActivePackage, { packageId: number; durationId: number }, { state: RootState }>(
  'billing/purchase',
  async ({ packageId, durationId }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<ActivePackage | ApiEnvelope<ActivePackage>, { duration_id: number }>(
      `/packages/${packageId}/purchase`,
      { method: 'POST', token, body: { duration_id: durationId } }
    );
    return unwrapApiData(res);
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBillingData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.plans = action.payload.plans;
        state.packages = action.payload.packages;
        state.durations = action.payload.durations;
        state.activePackages = action.payload.activePackages;
        state.balanceVnd = action.payload.balanceVnd;
      })
      .addCase(fetchBillingData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load billing data';
      })
      .addCase(topUpBalance.pending, (state) => {
        state.topUpStatus = 'loading';
        state.error = null;
      })
      .addCase(topUpBalance.fulfilled, (state, action) => {
        state.topUpStatus = 'succeeded';
        state.balanceVnd = action.payload;
      })
      .addCase(topUpBalance.rejected, (state, action) => {
        state.topUpStatus = 'failed';
        state.error = action.error.message ?? 'Failed to top up';
      })
      .addCase(purchasePackage.pending, (state) => {
        state.purchaseStatus = 'loading';
        state.error = null;
      })
      .addCase(purchasePackage.fulfilled, (state, action) => {
        state.purchaseStatus = 'succeeded';
        state.activePackages.unshift(action.payload);
      })
      .addCase(purchasePackage.rejected, (state, action) => {
        state.purchaseStatus = 'failed';
        state.error = action.error.message ?? 'Failed to purchase package';
      });
  },
});

export const { clearBillingError } = billingSlice.actions;
export const billingReducer = billingSlice.reducer;

