import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch } from '../lib/apiClient'
import type { RootState } from './store'

export type WebhookConfig = {
  url: string
  secret_token: string
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
  WebhookConfig,
  void,
  { state: RootState }
>('webhook/fetch', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  return await apiFetch<WebhookConfig>('/webhook', { method: 'GET', token })
})

type UpsertPayload = {
  url: string
  secret_token: string
  is_active: boolean
}

export const saveWebhookConfig = createAsyncThunk<
  WebhookConfig,
  UpsertPayload,
  { state: RootState }
>('webhook/save', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  return await apiFetch<WebhookConfig, UpsertPayload>('/webhook', {
    method: 'POST',
    token,
    body: payload,
  })
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

