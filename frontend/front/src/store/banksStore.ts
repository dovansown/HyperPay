import { create } from 'zustand'
import { bankApi, type Bank } from '../lib/api'

interface BanksState {
  banks: Bank[]
  isLoading: boolean
  error: string | null
  fetchBanks: () => Promise<void>
  createBank: (payload: { name: string; code: string; icon_url?: string }) => Promise<void>
  clearError: () => void
}

export const useBanksStore = create<BanksState>((set, get) => ({
  banks: [],
  isLoading: false,
  error: null,

  async fetchBanks() {
    set({ isLoading: true, error: null })
    try {
      const res = await bankApi.listBanks()
      set({ banks: res.data?.data ?? [], isLoading: false })
    } catch (err) {
      console.error('fetchBanks error', err)
      set({ isLoading: false, error: 'Không tải được danh sách ngân hàng.' })
    }
  },

  async createBank(payload) {
    set({ isLoading: true, error: null })
    try {
      await bankApi.createBank(payload)
      await get().fetchBanks()
    } catch (err) {
      console.error('createBank error', err)
      set({ isLoading: false, error: 'Tạo ngân hàng thất bại.' })
      throw err
    }
  },

  clearError() {
    if (get().error) set({ error: null })
  },
}))

