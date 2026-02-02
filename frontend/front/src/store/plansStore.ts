import { create } from 'zustand'
import { planApi, type Plan } from '../lib/api'

interface PlansState {
  plans: Plan[]
  isLoading: boolean
  error: string | null
  fetchPlans: () => Promise<void>
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  isLoading: false,
  error: null,

  async fetchPlans() {
    set({ isLoading: true, error: null })
    try {
      const res = await planApi.listPlans()
      set({ plans: res.data?.data ?? [], isLoading: false })
    } catch (err) {
      console.error('fetchPlans error', err)
      set({ isLoading: false, error: 'Không tải được danh sách gói.' })
    }
  },
}))

