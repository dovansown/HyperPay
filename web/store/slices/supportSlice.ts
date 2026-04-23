import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData } from '@/lib/apiClient';

export type SupportTicket = {
  id: string;
  code: string;
  subject: string;
  description?: string;
  category: 'BILLING' | 'TECHNICAL' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};

export type TicketReply = {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaffReply: boolean;
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

  selectedTicket: SupportTicket | null;
  ticketDetailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  ticketDetailError: string | null;

  replies: TicketReply[];
  repliesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  repliesError: string | null;

  replyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  replyError: string | null;
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
  selectedTicket: null,
  ticketDetailStatus: 'idle',
  ticketDetailError: null,
  replies: [],
  repliesStatus: 'idle',
  repliesError: null,
  replyStatus: 'idle',
  replyError: null,
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

export const fetchTicketDetailThunk = createAsyncThunk<
  SupportTicket,
  string,
  { state: { auth: { token: string | null } } }
>('support/fetchTicketDetail', async (ticketId, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<SupportTicket>(`/support/tickets/${ticketId}`, { token });
  return unwrapApiData(res);
});

export const fetchTicketRepliesThunk = createAsyncThunk<
  TicketReply[],
  string,
  { state: { auth: { token: string | null } } }
>('support/fetchTicketReplies', async (ticketId, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<TicketReply[]>(`/support/tickets/${ticketId}/replies`, { token });
  return unwrapApiData(res);
});

export const createTicketReplyThunk = createAsyncThunk<
  TicketReply,
  { ticketId: string; message: string },
  { state: { auth: { token: string | null } } }
>('support/createTicketReply', async ({ ticketId, message }, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<TicketReply, { message: string }>(
    `/support/tickets/${ticketId}/replies`,
    { token, method: 'POST', body: { message } }
  );
  return unwrapApiData(res);
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearSupportError(state) {
      state.error = null;
      state.createError = null;
      state.ticketDetailError = null;
      state.repliesError = null;
      state.replyError = null;
    },
    clearSelectedTicket(state) {
      state.selectedTicket = null;
      state.replies = [];
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
      })
      .addCase(fetchTicketDetailThunk.pending, (state) => {
        state.ticketDetailStatus = 'loading';
        state.ticketDetailError = null;
      })
      .addCase(fetchTicketDetailThunk.fulfilled, (state, action) => {
        state.ticketDetailStatus = 'succeeded';
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicketDetailThunk.rejected, (state, action) => {
        state.ticketDetailStatus = 'failed';
        state.ticketDetailError = action.error.message ?? 'Fetch ticket detail failed';
      })
      .addCase(fetchTicketRepliesThunk.pending, (state) => {
        state.repliesStatus = 'loading';
        state.repliesError = null;
      })
      .addCase(fetchTicketRepliesThunk.fulfilled, (state, action) => {
        state.repliesStatus = 'succeeded';
        state.replies = action.payload;
      })
      .addCase(fetchTicketRepliesThunk.rejected, (state, action) => {
        state.repliesStatus = 'failed';
        state.repliesError = action.error.message ?? 'Fetch replies failed';
      })
      .addCase(createTicketReplyThunk.pending, (state) => {
        state.replyStatus = 'loading';
        state.replyError = null;
      })
      .addCase(createTicketReplyThunk.fulfilled, (state, action) => {
        state.replyStatus = 'succeeded';
        state.replies.push(action.payload);
      })
      .addCase(createTicketReplyThunk.rejected, (state, action) => {
        state.replyStatus = 'failed';
        state.replyError = action.error.message ?? 'Create reply failed';
      });
  },
});

export const { clearSupportError, clearSelectedTicket } = supportSlice.actions;
export const supportReducer = supportSlice.reducer;