import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface UserPackage {
  id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  package: {
    id: string;
    name: string;
    status: string;
    price_vnd: number;
  };
  start_at: string;
  end_at: string;
  status: string;
  used_transactions: number;
  used_webhook_deliveries: number;
  used_bank_types: number;
}

interface AdminUserPackagesState {
  userPackages: {
    items: UserPackage[];
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
  status?: string;
  user_id?: string;
  package_id?: string;
}

interface AssignUserPackageInput {
  user_id: string;
  package_id: string;
  duration_id?: string;
  duration_days?: number;
  start_at?: string;
  end_at?: string;
  status?: string;
}

const initialState: AdminUserPackagesState = {
  userPackages: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminUserPackages = createAsyncThunk(
  'adminUserPackages/fetchUserPackages',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.status) params.append('status', query.status);
    if (query.user_id) params.append('user_id', query.user_id);
    if (query.package_id) params.append('package_id', query.package_id);

    const response = await apiFetch<{
      items: UserPackage[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: UserPackage[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/user-packages?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

export const assignUserPackage = createAsyncThunk(
  'adminUserPackages/assignPackage',
  async (data: AssignUserPackageInput, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<UserPackage | ApiEnvelope<UserPackage>>('/admin/user-packages/assign', {
      method: 'POST',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const updateUserPackageStatus = createAsyncThunk(
  'adminUserPackages/updateStatus',
  async ({ id, status }: { id: string; status: string }, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<UserPackage | ApiEnvelope<UserPackage>>(`/admin/user-packages/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    });

    return unwrapApiData(response);
  }
);

// Slice
const adminUserPackagesSlice = createSlice({
  name: 'adminUserPackages',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Packages
      .addCase(fetchAdminUserPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.userPackages = action.payload as any;
      })
      .addCase(fetchAdminUserPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user packages';
      })
      // Assign Package
      .addCase(assignUserPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUserPackage.fulfilled, (state, action) => {
        state.loading = false;
        const packageData = action.payload as any;
        state.userPackages.items.unshift(packageData);
        state.userPackages.total += 1;
      })
      .addCase(assignUserPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to assign package';
      })
      // Update Status
      .addCase(updateUserPackageStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPackageStatus.fulfilled, (state, action) => {
        state.loading = false;
        const packageData = action.payload as any;
        const index = state.userPackages.items.findIndex((p) => p.id === packageData.id);
        if (index !== -1) {
          state.userPackages.items[index] = packageData;
        }
      })
      .addCase(updateUserPackageStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update status';
      });
  },
});

export const { clearError } = adminUserPackagesSlice.actions;
export const adminUserPackagesReducer = adminUserPackagesSlice.reducer;
