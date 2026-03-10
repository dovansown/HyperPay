import { create } from 'zustand'
import { accountApi, type BankAccount } from '../lib/api'

interface AccountsState {
  accounts: BankAccount[]
  latestTokens: Record<number, string>
  isLoading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  createAccount: (payload: {
    bank_name: string
    account_number: string
    account_holder: string
  }) => Promise<void>
  refreshAccountToken: (accountId: number) => Promise<void>
  clearError: () => void
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  latestTokens: {},
  isLoading: false,
  error: null,

  async fetchAccounts() {
    set({ isLoading: true, error: null })
    try {
      const res = await accountApi.listAccounts()
      set({ accounts: res.data.data ?? [], isLoading: false })
    } catch (err) {
      console.error('fetchAccounts error', err)
      set({ isLoading: false, error: 'Không tải được danh sách tài khoản.' })
    }
  },

  async createAccount(payload) {
    set({ isLoading: true, error: null })
    try {
      const res = await accountApi.createAccount(payload)
      const token = res.data.data.token
      const accountId = res.data.data.account.id
      await get().fetchAccounts()
      set((state) => ({
        latestTokens: {
          ...state.latestTokens,
          [accountId]: token,
        },
      }))
    } catch (err) {
      console.error('createAccount error', err)
      set({ isLoading: false, error: 'Tạo tài khoản ngân hàng thất bại.' })
      throw err
    }
  },

  async refreshAccountToken(accountId) {
    set({ isLoading: true, error: null })
    try {
      const res = await accountApi.refreshToken(accountId)
      await get().fetchAccounts()
      set((state) => ({
        latestTokens: {
          ...state.latestTokens,
          [accountId]: res.data.data.token,
        },
      }))
    } catch (err) {
      console.error('refreshAccountToken error', err)
      set({ isLoading: false, error: 'Refresh API token thất bại.' })
      throw err
    }
  },

  clearError() {
    if (get().error) set({ error: null })
  },
}))

