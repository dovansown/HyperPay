import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface Package {
  id: string;
  name: string;
  status: string;
  is_default: boolean;
  apply_default_discount: boolean;
  price_vnd: number;
  duration_days: number | null;
  max_transactions: number;
  max_webhook_deliveries: number;
  max_bank_types: number;
  description: string | null;
  created_at: string;
  banks: Array<{
    bank_id: string;
    account_limit: number;
    bank: { id: string; name: string; code: string } | null;
  }>;
  pricing: Array<{
    duration_id: string;
    duration_name: string;
    months: number;
    days: number;
    is_default: boolean;
    discount_percent: number | null;
    price_vnd: number;
  }>;
}

interface AdminPackagesState {
  packages: {
    items: Package[];
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
  min_price_vnd?: number;
  max_price_vnd?: number;
}

interface CreatePackageInput {
  name: string;
  status?: string;
  is_default?: boolean;
  apply_default_discount?: boolean;
  price_vnd: number;
  max_transactions: number;
  max_webhook_deliveries: number;
  description?: string;
  banks: Array<{ bank_id: string; account_limit: number }>;
  pricing: Array<{ duration_id: string; price_vnd: number }>;
}

interface UpdatePackageInput extends Partial<CreatePackageInput> {}

const initialState: AdminPackagesState = {
  packages: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminPackages = createAsyncThunk(
  'adminPackages/fetchPackages',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.min_price_vnd) params.append('min_price_vnd', query.min_price_vnd.toString());
    if (query.max_price_vnd) params.append('max_price_vnd', query.max_price_vnd.toString());

    const response = await apiFetch<{
      items: Package[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: Package[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/packages?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

export const createPackage = createAsyncThunk(
  'adminPackages/createPackage',
  async (data: CreatePackageInput, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Package | ApiEnvelope<Package>>('/admin/packages', {
      method: 'POST',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const updatePackage = createAsyncThunk(
  'adminPackages/updatePackage',
  async ({ id, data }: { id: string; data: UpdatePackageInput }, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Package | ApiEnvelope<Package>>(`/admin/packages/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

// Slice
const adminPackagesSlice = createSlice({
  name: 'adminPackages',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Packages
      .addCase(fetchAdminPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload as any;
      })
      .addCase(fetchAdminPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch packages';
      })
      // Create Package
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        const packageData = action.payload as any;
        state.packages.items.unshift(packageData);
        state.packages.total += 1;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create package';
      })
      // Update Package
      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.loading = false;
        const packageData = action.payload as any;
        const index = state.packages.items.findIndex((p) => p.id === packageData.id);
        if (index !== -1) {
          state.packages.items[index] = packageData;
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update package';
      });
  },
});

export const { clearError } = adminPackagesSlice.actions;
export const adminPackagesReducer = adminPackagesSlice.reducer;
