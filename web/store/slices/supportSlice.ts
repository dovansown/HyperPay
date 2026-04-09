import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData } from '@/lib/apiClient';

export type SupportTicket = {
  id: string;
  code: string;
  subject: string;
  category: 'BILLING' | 'TECHNICAL' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};

type TicketsResponse = {
  items: SupportTicket[];
  page: number;
  limit: number;
  total: number;
};

type SupportState = {
  tickets: SupportTicket[];
  page: number;
  limit: number;
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createError: string | null;
};

const initialState: SupportState = {
  tickets: [],
  page: 1,
  limit: 20,
  total: 0,
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
};

export const fetchTicketsThunk = createAsyncThunk<
  TicketsResponse,
  { q?: string; status?: SupportTicket['status']; priority?: SupportTicket['priority']; category?: SupportTicket['category']; page?: number; limit?: number } | undefined,
  { state: { auth: { token: string | null } } }
>('support/fetchTickets', async (arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const qs = new URLSearchParams();
  if (arg?.q) qs.set('q', arg.q);
  if (arg?.status) qs.set('status', arg.status);
  if (arg?.priority) qs.set('priority', arg.priority);
  if (arg?.category) qs.set('category', arg.category);
  if (arg?.page) qs.set('page', String(arg.page));
  if (arg?.limit) qs.set('limit', String(arg.limit));

  const path = qs.toString() ? `/support/tickets?${qs.toString()}` : '/support/tickets';
  const res = await apiFetch<TicketsResponse>(path, { token });
  return unwrapApiData(res);
});

export const createTicketThunk = createAsyncThunk<
  SupportTicket,
  { subject: string; description: string; category: SupportTicket['category']; priority?: SupportTicket['priority'] },
  { state: { auth: { token: string | null } } }
>('support/createTicket', async (body, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<SupportTicket, typeof body>('/support/tickets', { token, method: 'POST', body });
  return unwrapApiData(res);
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearSupportError(state) {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTicketsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tickets = action.payload.items;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
      })
      .addCase(fetchTicketsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Fetch tickets failed';
      })
      .addCase(createTicketThunk.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createTicketThunk.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.tickets = [action.payload, ...state.tickets];
        state.total += 1;
      })
      .addCase(createTicketThunk.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.error.message ?? 'Create ticket failed';
      });
  },
});

export const { clearSupportError } = supportSlice.actions;
export const supportReducer = supportSlice.reducer;

