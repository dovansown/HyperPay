import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type WebhookAuthType = 'NONE' | 'BEARER' | 'BASIC' | 'HEADER';
export type WebhookContentType = 'JSON' | 'FORM_URLENCODED';
export type TransactionDirectionFilter = 'IN' | 'OUT' | 'BOTH';
export type PaymentCodeCharset = 'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC';

export type WebhookConfig = {
  id: string;
  url: string;
  secret_token: string;
  account_ids: string[];
  account_numbers?: string[];
  transaction_direction: TransactionDirectionFilter;
  retry_on_non_2xx: boolean;
  max_retry_attempts: number;
  content_type: WebhookContentType;
  auth_type: WebhookAuthType;
  auth_header_name?: string | null;
  auth_header_value?: string | null;
  auth_bearer_token?: string | null;
  auth_username?: string | null;
  auth_password?: string | null;
  require_payment_code: boolean;
  payment_code_rule_enabled: boolean;
  payment_code_prefix?: string | null;
  payment_code_suffix_min_length?: number | null;
  payment_code_suffix_max_length?: number | null;
  payment_code_suffix_charset?: PaymentCodeCharset | null;
  is_active: boolean;
};

export type WebhookDeliveryLogEntry = {
  id: string;
  url: string;
  event_type: string;
  response_status_code: number;
  success: boolean;
  error_message: string | null;
  request_payload: string | null;
  response_body: string | null;
  created_at: string;
};

type WebhookState = {
  items: WebhookConfig[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  logs: WebhookDeliveryLogEntry[];
  logsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  lastTestQueued: boolean | null;
};

const initialState: WebhookState = {
  items: [],
  status: 'idle',
  error: null,
  logs: [],
  logsStatus: 'idle',
  lastTestQueued: null,
};

export const fetchWebhookConfig = createAsyncThunk<WebhookConfig[], void, { state: RootState }>(
  'webhook/fetch',
  async (_, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<WebhookConfig[] | ApiEnvelope<WebhookConfig[]>>('/webhook', { method: 'GET', token });
    const data = unwrapApiData(res);
    return Array.isArray(data) ? data : [];
  }
);

export type UpsertWebhookPayload = Omit<WebhookConfig, 'id' | 'account_numbers'> & { id?: string };

export const saveWebhookConfig = createAsyncThunk<WebhookConfig, UpsertWebhookPayload, { state: RootState }>(
  'webhook/save',
  async (payload, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const { id, ...body } = payload;
    const res = id
      ? await apiFetch<WebhookConfig | ApiEnvelope<WebhookConfig>, typeof body>(`/webhook/${id}`, {
          method: 'PUT',
          token,
          body,
        })
      : await apiFetch<WebhookConfig | ApiEnvelope<WebhookConfig>, typeof body>('/webhook', {
          method: 'POST',
          token,
          body,
        });
    return unwrapApiData(res);
  }
);

export const deleteWebhookConfig = createAsyncThunk<{ deleted: boolean; id: string }, string, { state: RootState }>(
  'webhook/delete',
  async (id, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<{ deleted: boolean } | ApiEnvelope<{ deleted: boolean }>>(`/webhook/${id}`, {
      method: 'DELETE',
      token,
    });
    const data = unwrapApiData(res);
    return { deleted: data.deleted, id };
  }
);

export const fetchWebhookLogs = createAsyncThunk<WebhookDeliveryLogEntry[], { limit?: number }, { state: RootState }>(
  'webhook/fetchLogs',
  async ({ limit = 50 }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<WebhookDeliveryLogEntry[] | ApiEnvelope<WebhookDeliveryLogEntry[]>>(
      `/webhook/logs?limit=${limit}`,
      { method: 'GET', token }
    );
    const data = unwrapApiData(res);
    return Array.isArray(data) ? data : [];
  }
);

export const sendTestEvent = createAsyncThunk<{ queued: boolean }, { webhookId?: string }, { state: RootState }>(
  'webhook/sendTest',
  async ({ webhookId }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<{ queued: boolean } | ApiEnvelope<{ queued: boolean }>, { webhook_id?: string }>(
      '/webhook/test',
      { method: 'POST', token, body: webhookId ? { webhook_id: webhookId } : {} }
    );
    return unwrapApiData(res);
  }
);

const webhookSlice = createSlice({
  name: 'webhook',
  initialState,
  reducers: {
    clearWebhookError(state) {
      state.error = null;
    },
    clearLastTestQueued(state) {
      state.lastTestQueued = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebhookConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchWebhookConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load webhook configuration';
      })
      .addCase(saveWebhookConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.items.findIndex((w) => w.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(saveWebhookConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to save webhook';
      })
      .addCase(deleteWebhookConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.deleted) {
          state.items = state.items.filter((w) => w.id !== action.payload.id);
        }
      })
      .addCase(deleteWebhookConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to delete webhook';
      })
      .addCase(fetchWebhookLogs.pending, (state) => {
        state.logsStatus = 'loading';
      })
      .addCase(fetchWebhookLogs.fulfilled, (state, action) => {
        state.logsStatus = 'succeeded';
        state.logs = action.payload;
      })
      .addCase(fetchWebhookLogs.rejected, (state) => {
        state.logsStatus = 'failed';
      })
      .addCase(sendTestEvent.fulfilled, (state, action) => {
        state.lastTestQueued = action.payload.queued;
      })
      .addCase(sendTestEvent.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to queue test event';
        state.lastTestQueued = false;
      });
  },
});

export const { clearWebhookError, clearLastTestQueued } = webhookSlice.actions;
export const webhookReducer = webhookSlice.reducer;

