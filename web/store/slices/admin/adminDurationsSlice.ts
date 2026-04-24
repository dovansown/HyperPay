import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface Duration {
  id: string;
  name: string;
  months: number;
  days: number;
  sort_order: number;
  is_default: boolean;
  discount_percent: number | null;
}

interface AdminDurationsState {
  durations: Duration[];
  loading: boolean;
  error: string | null;
}

interface CreateDurationInput {
  name: string;
  months: number;
  days: number;
  sort_order?: number;
  is_default?: boolean;
  discount_percent?: number | null;
}

interface UpdateDurationInput extends Partial<CreateDurationInput> {}

const initialState: AdminDurationsState = {
  durations: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminDurations = createAsyncThunk(
  'adminDurations/fetchDurations',
  async (_, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Duration[] | ApiEnvelope<Duration[]>>('/admin/durations', { token });

    return unwrapApiData(response);
  }
);

export const createDuration = createAsyncThunk(
  'adminDurations/createDuration',
  async (data: CreateDurationInput, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Duration | ApiEnvelope<Duration>>('/admin/durations', {
      method: 'POST',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const updateDuration = createAsyncThunk(
  'adminDurations/updateDuration',
  async ({ id, data }: { id: string; data: UpdateDurationInput }, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<Duration | ApiEnvelope<Duration>>(`/admin/durations/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const deleteDuration = createAsyncThunk(
  'adminDurations/deleteDuration',
  async (id: string, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    await apiFetch<{ id: string }>(`/admin/durations/${id}`, {
      method: 'DELETE',
      token,
    });

    return id;
  }
);

// Slice
const adminDurationsSlice = createSlice({
  name: 'adminDurations',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Durations
      .addCase(fetchAdminDurations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDurations.fulfilled, (state, action) => {
        state.loading = false;
        state.durations = Array.isArray(action.payload) ? action.payload : (action.payload as any).data || [];
      })
      .addCase(fetchAdminDurations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch durations';
      })
      // Create Duration
      .addCase(createDuration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDuration.fulfilled, (state, action) => {
        state.loading = false;
        const durationData = action.payload as any;
        state.durations.push(durationData);
        state.durations.sort((a, b) => a.sort_order - b.sort_order);
      })
      .addCase(createDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create duration';
      })
      // Update Duration
      .addCase(updateDuration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDuration.fulfilled, (state, action) => {
        state.loading = false;
        const durationData = action.payload as any;
        const index = state.durations.findIndex((d) => d.id === durationData.id);
        if (index !== -1) {
          state.durations[index] = durationData;
        }
        state.durations.sort((a, b) => a.sort_order - b.sort_order);
      })
      .addCase(updateDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update duration';
      })
      // Delete Duration
      .addCase(deleteDuration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDuration.fulfilled, (state, action) => {
        state.loading = false;
        state.durations = state.durations.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete duration';
      });
  },
});

export const { clearError } = adminDurationsSlice.actions;
export const adminDurationsReducer = adminDurationsSlice.reducer;
