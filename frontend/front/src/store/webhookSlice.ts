import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

export type WebhookConfig = {
  id: string
  url: string
  secret_token: string
  account_ids: string[]
  account_numbers?: string[]
  transaction_direction: 'IN' | 'OUT' | 'BOTH'
  retry_on_non_2xx: boolean
  max_retry_attempts: number
  content_type: 'JSON' | 'FORM_URLENCODED'
  auth_type: 'NONE' | 'BEARER' | 'BASIC' | 'HEADER'
  auth_header_name?: string | null
  auth_header_value?: string | null
  auth_bearer_token?: string | null
  auth_username?: string | null
  auth_password?: string | null
  require_payment_code: boolean
  payment_code_rule_enabled: boolean
  payment_code_prefix?: string | null
  payment_code_suffix_min_length?: number | null
  payment_code_suffix_max_length?: number | null
  payment_code_suffix_charset?: 'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC' | null
  is_active: boolean
}

export type WebhookDeliveryLogEntry = {
  id: string
  url: string
  event_type: string
  response_status_code: number
  success: boolean
  error_message: string | null
  request_payload: string | null
  response_body: string | null
  created_at: string
}

type WebhookState = {
  items: WebhookConfig[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  logs: WebhookDeliveryLogEntry[]
  logsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: WebhookState = {
  items: [],
  status: 'idle',
  error: null,
  logs: [],
  logsStatus: 'idle',
}

export const fetchWebhookConfig = createAsyncThunk<
  WebhookConfig[],
  void,
  { state: RootState }
>('webhook/fetch', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<WebhookConfig[] | ApiEnvelope<WebhookConfig[]>>('/webhook', {
    method: 'GET',
    token,
  })
  const data = unwrapApiData<WebhookConfig[] | null>(res)
  return Array.isArray(data) ? data : []
})

type UpsertPayload = {
  id?: string
  url: string
  secret_token: string
  account_ids: string[]
  transaction_direction: 'IN' | 'OUT' | 'BOTH'
  retry_on_non_2xx: boolean
  max_retry_attempts: number
  content_type: 'JSON' | 'FORM_URLENCODED'
  auth_type: 'NONE' | 'BEARER' | 'BASIC' | 'HEADER'
  auth_header_name?: string
  auth_header_value?: string
  auth_bearer_token?: string
  auth_username?: string
  auth_password?: string
  require_payment_code: boolean
  payment_code_rule_enabled: boolean
  payment_code_prefix?: string
  payment_code_suffix_min_length?: number
  payment_code_suffix_max_length?: number
  payment_code_suffix_charset?: 'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC'
  is_active: boolean
}

export const saveWebhookConfig = createAsyncThunk<
  WebhookConfig,
  UpsertPayload,
  { state: RootState }
>('webhook/save', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const isUpdate = Boolean(payload.id)
  const body = { ...payload, id: undefined }
  const res = isUpdate
    ? await apiFetch<WebhookConfig | ApiEnvelope<WebhookConfig>, Omit<UpsertPayload, 'id'>>(
        `/webhook/${payload.id}`,
        { method: 'PUT', token, body }
      )
    : await apiFetch<WebhookConfig | ApiEnvelope<WebhookConfig>, Omit<UpsertPayload, 'id'>>(
        '/webhook',
        { method: 'POST', token, body }
      )
  return unwrapApiData<WebhookConfig>(res)
})

export type SendTestResult = { queued: boolean }

export const sendTestEvent = createAsyncThunk<
  SendTestResult,
  string | undefined,
  { state: RootState }
>('webhook/sendTest', async (webhookId, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<SendTestResult | ApiEnvelope<SendTestResult>>('/webhook/test', {
    method: 'POST',
    token,
    body: webhookId ? { webhook_id: webhookId } : {},
  })
  if (res && typeof res === 'object' && 'queued' in res) {
    return res as SendTestResult
  }
  const data = (res as ApiEnvelope<SendTestResult>)?.data
  return data ?? { queued: false }
})

export const fetchWebhookLogs = createAsyncThunk<
  WebhookDeliveryLogEntry[],
  void,
  { state: RootState }
>('webhook/fetchLogs', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<WebhookDeliveryLogEntry[] | ApiEnvelope<WebhookDeliveryLogEntry[]>>(
    '/webhook/logs?limit=50',
    { method: 'GET', token }
  )
  const data = unwrapApiData(res)
  return Array.isArray(data) ? data : []
})

export type DeleteWebhookResult = { deleted: boolean }

export const deleteWebhookConfig = createAsyncThunk<
  DeleteWebhookResult,
  string,
  { state: RootState }
>('webhook/delete', async (id, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<DeleteWebhookResult | ApiEnvelope<DeleteWebhookResult>>(`/webhook/${id}`, {
    method: 'DELETE',
    token,
  })
  return unwrapApiData<DeleteWebhookResult>(res)
})

const webhookSlice = createSlice({
  name: 'webhook',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebhookConfig.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchWebhookConfig.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load webhook configuration'
      })
      .addCase(saveWebhookConfig.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(saveWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((w) => w.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        else state.items.push(action.payload)
      })
      .addCase(saveWebhookConfig.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to save webhook configuration'
      })
      .addCase(fetchWebhookLogs.pending, (state) => {
        state.logsStatus = 'loading'
      })
      .addCase(fetchWebhookLogs.fulfilled, (state, action) => {
        state.logsStatus = 'succeeded'
        state.logs = action.payload
      })
      .addCase(fetchWebhookLogs.rejected, (state) => {
        state.logsStatus = 'failed'
      })
      .addCase(deleteWebhookConfig.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteWebhookConfig.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload?.deleted && action.meta.arg) {
          state.items = state.items.filter((w) => w.id !== action.meta.arg)
        }
      })
      .addCase(deleteWebhookConfig.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to delete webhook'
      })
  },
})

export const webhookReducer = webhookSlice.reducer

