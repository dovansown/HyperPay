import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

interface AdminUsersState {
  users: {
    items: User[];
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
  role?: string;
}

const initialState: AdminUsersState = {
  users: {
    items: [],
    total: 0,
    limit: 25,
    offset: 0,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (query: AdminListQuery = {}, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.q) params.append('q', query.q);
    if (query.role) params.append('role', query.role);

    const response = await apiFetch<{
      items: User[];
      total: number;
      limit: number;
      offset: number;
    } | ApiEnvelope<{
      items: User[];
      total: number;
      limit: number;
      offset: number;
    }>>(`/admin/users?${params.toString()}`, { token });

    return unwrapApiData(response);
  }
);

export const updateUserRole = createAsyncThunk(
  'adminUsers/updateRole',
  async (
    { userId, role }: { userId: string; role: string },
    { getState }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<User | ApiEnvelope<User>>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
      token,
    });

    return unwrapApiData(response);
  }
);

// Slice
const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload as any;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Update Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload as any;
        const index = state.users.items.findIndex((u) => u.id === userData.id);
        if (index !== -1) {
          state.users.items[index] = userData;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update role';
      });
  },
});

export const { clearError } = adminUsersSlice.actions;
export const adminUsersReducer = adminUsersSlice.reducer;
