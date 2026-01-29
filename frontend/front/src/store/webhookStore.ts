import { create } from 'zustand'
import { webhookApi, type WebhookConfig } from '../lib/api'

interface WebhookState {
  config: WebhookConfig | null
  isLoading: boolean
  error: string | null
  fetchConfig: () => Promise<void>
  upsertConfig: (payload: WebhookConfig) => Promise<void>
  clearError: () => void
}

export const useWebhookStore = create<WebhookState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  async fetchConfig() {
    set({ isLoading: true, error: null })
    try {
      const res = await webhookApi.getConfig()
      set({ config: res.data ?? null, isLoading: false })
    } catch (err) {
      console.error('fetchConfig error', err)
      // backend có thể trả 404 nếu chưa cấu hình: coi như null
      set({ config: null, isLoading: false })
    }
  },

  async upsertConfig(payload) {
    set({ isLoading: true, error: null })
    try {
      const res = await webhookApi.upsertConfig(payload)
      set({ config: res.data ?? payload, isLoading: false })
    } catch (err) {
      console.error('upsertConfig error', err)
      set({ isLoading: false, error: 'Lưu cấu hình webhook thất bại.' })
      throw err
    }
  },

  clearError() {
    if (get().error) set({ error: null })
  },
}))

