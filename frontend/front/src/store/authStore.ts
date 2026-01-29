import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  authApi,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  type ForgotPasswordPayload,
  setAuthToken,
} from '../lib/api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  // actions
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      async login(payload) {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.login(payload)
          console.log(res.data)
          const { token } = res.data.data
          
          setAuthToken(token)
          set({ token, isLoading: false })
        } catch (err: unknown) {
          console.error('Login error', err)
          set({
            isLoading: false,
            error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.',
          })
          throw err
        }
      },

      async register(payload) {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register(payload)
          const { token } = res.data.data
          setAuthToken(token)
          set({ token, isLoading: false })
        } catch (err: unknown) {
          console.error('Register error', err)
          set({
            isLoading: false,
            error: 'Đăng ký thất bại. Vui lòng thử lại.',
          })
          throw err
        }
      },

      async forgotPassword(payload) {
        set({ isLoading: true, error: null })
        try {
          await authApi.forgotPassword(payload)
          set({ isLoading: false })
        } catch (err: unknown) {
          console.error('Forgot password error', err)
          set({
            isLoading: false,
            error: 'Không gửi được email khôi phục. Vui lòng thử lại.',
          })
          throw err
        }
      },

      logout() {
        setAuthToken(null)
        set({ user: null, token: null })
      },

      clearError() {
        if (get().error) {
          set({ error: null })
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token)
        }
      },
    },
  ),
)

