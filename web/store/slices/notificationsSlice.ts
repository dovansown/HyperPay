import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData } from '@/lib/apiClient';

export type NotificationItem = {
  id: string;
  type: 'SYSTEM' | 'WEBHOOK' | 'BILLING' | 'SECURITY' | 'SUPPORT';
  title: string;
  body?: string | null;
  data?: unknown;
  readAt?: string | null;
  createdAt: string;
};

type ListResponse = {
  items: NotificationItem[];
  page: number;
  limit: number;
  total: number;
  unread_count: number;
};

type NotificationsState = {
  items: NotificationItem[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  status: 'idle',
  error: null,
};

export const fetchNotificationsThunk = createAsyncThunk<
  ListResponse,
  { page?: number; limit?: number; unreadOnly?: boolean } | undefined,
  { state: { auth: { token: string | null } } }
>('notifications/list', async (arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const qs = new URLSearchParams();
  qs.set('page', String(arg?.page ?? 1));
  qs.set('limit', String(arg?.limit ?? 10));
  if (typeof arg?.unreadOnly === 'boolean') qs.set('unread_only', String(arg.unreadOnly));
  const res = await apiFetch<ListResponse>(`/notifications?${qs.toString()}`, { token });
  return unwrapApiData(res);
});

export const markNotificationReadThunk = createAsyncThunk<
  { success: true },
  { id: string },
  { state: { auth: { token: string | null } } }
>('notifications/markRead', async (arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ success: true }>(`/notifications/${arg.id}/read`, { token, method: 'POST' });
  return unwrapApiData(res);
});

export const markAllNotificationsReadThunk = createAsyncThunk<
  { success: true; updated?: number },
  void,
  { state: { auth: { token: string | null } } }
>('notifications/markAllRead', async (_arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ success: true; updated?: number }>(`/notifications/read-all`, { token, method: 'POST' });
  return unwrapApiData(res);
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Fetch notifications failed';
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        if (!action.meta.arg?.id) return;
        const item = state.items.find((x) => x.id === action.meta.arg.id);
        if (item && !item.readAt) {
          item.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.items = state.items.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() }));
        state.unreadCount = 0;
      });
  },
});

export const notificationsReducer = notificationsSlice.reducer;

