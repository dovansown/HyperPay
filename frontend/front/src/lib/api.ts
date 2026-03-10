import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cho phép set/remove JWT cho mọi request
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.Authorization
  }
}

// ==== Kiểu dữ liệu cơ bản ====

export interface AuthUser {
  id: number
  email: string
  full_name: string
}

export interface ResponsePagination<T> {
  success: boolean
  data: T
  meta?: Record<string, unknown>
  requestId: string
}

export interface AuthResponse {
  success: boolean
  data: {
    token: string
    user: AuthUser
  }
  requestId: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface BankAccount {
  id: number
  bank_name: string
  account_number: string
  account_holder: string
  api_token_suffix?: string
}

export interface CreateAccountResponse {
  account: BankAccount
  token: string
}

export interface RefreshTokenResponse {
  token: string
}

export interface Plan {
  id: number
  name: string
  price_vnd: number
  max_bank_accounts: number
  max_transactions: number
  duration_days: number
  description: string
}

export interface Bank {
  id: number
  name: string
  code: string
  icon_url?: string
}

export interface WebhookConfig {
  url: string
  secret_token: string
  is_active: boolean
}

// ==== API wrapper theo backend/api.http ====

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>('/auth/register', payload)
  },
  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>('/auth/login', payload)
  },
  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient.post<void>('/auth/forgot-password', payload)
  },
}

export const accountApi = {
  createAccount(data: {
    bank_name: string
    account_number: string
    account_holder: string
  }) {
    return apiClient.post<ResponsePagination<CreateAccountResponse>>('/accounts', data)
  },
  listAccounts() {
    return apiClient.get<ResponsePagination<BankAccount[]>>('/accounts')
  },
  refreshToken(accountId: number) {
    return apiClient.post<ResponsePagination<RefreshTokenResponse>>(
      `/accounts/${accountId}/token/refresh`,
    )
  },
  listTransactions(accountId: number) {
    return apiClient.get(`/accounts/${accountId}/transactions`)
  },
}

export const planApi = {
  listPlans() {
    return apiClient.get<ResponsePagination<Plan[]>>('/plans')
  },
}

export const bankApi = {
  listBanks() {
    return apiClient.get<ResponsePagination<Bank[]>>('/banks')
  },
  createBank(data: { name: string; code: string; icon_url?: string }) {
    return apiClient.post<ResponsePagination<Bank>>('/banks', data)
  },
}

export const webhookApi = {
  getConfig() {
    return apiClient.get<ResponsePagination<WebhookConfig | null>>('/webhook')
  },
  upsertConfig(data: WebhookConfig) {
    return apiClient.post<ResponsePagination<WebhookConfig>>('/webhook', data)
  },
}

