import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

export type WebhookConfig = {
  url: string
  secret_token: string
  account_ids: number[]
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

type WebhookState = {
  config: WebhookConfig | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: WebhookState = {
  config: null,
  status: 'idle',
  error: null,
}

export const fetchWebhookConfig = createAsyncThunk<
  WebhookConfig | null,
  void,
  { state: RootState }
>('webhook/fetch', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<WebhookConfig | null | ApiEnvelope<WebhookConfig | null>>('/webhook', {
    method: 'GET',
    token,
  })
  return unwrapApiData<WebhookConfig | null>(res)
})

type UpsertPayload = {
  url: string
  secret_token: string
  account_ids: number[]
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
  const res = await apiFetch<WebhookConfig | ApiEnvelope<WebhookConfig>, UpsertPayload>('/webhook', {
    method: 'POST',
    token,
    body: payload,
  })
  return unwrapApiData<WebhookConfig>(res)
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
        state.config = action.payload
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
        state.config = action.payload
      })
      .addCase(saveWebhookConfig.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to save webhook configuration'
      })
  },
})

export const webhookReducer = webhookSlice.reducer

