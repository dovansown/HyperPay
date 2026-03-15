import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch } from '../lib/apiClient'
import type { RootState } from './store'

export type BankAccount = {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
}

type AccountsState = {
  items: BankAccount[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

type Envelope<T> = {
  success?: boolean
  data?: T
}

function extractAccounts(payload: BankAccount[] | Envelope<unknown>): BankAccount[] {
  if (Array.isArray(payload)) return payload
  const data = (payload as Envelope<unknown>).data
  if (Array.isArray(data)) return data as BankAccount[]
  if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: BankAccount[] }).items
  }
  return []
}

function extractAccount(payload: BankAccount | Envelope<unknown>): BankAccount {
  if (payload && typeof payload === 'object' && 'id' in payload) return payload as BankAccount
  const data = (payload as Envelope<unknown>).data
  if (!data || typeof data !== 'object') throw new Error('Invalid account response')
  const d = data as Record<string, unknown>
  // API create trả về { data: { account: BankAccount, token } }
  if (d.account && typeof d.account === 'object' && 'id' in (d.account as object)) {
    return d.account as BankAccount
  }
  if ('id' in d) return data as BankAccount
  throw new Error('Invalid account response')
}

const initialState: AccountsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchAccounts = createAsyncThunk<
  BankAccount[],
  void,
  { state: RootState }
>('accounts/fetchAll', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<BankAccount[] | Envelope<unknown>>('/accounts', { method: 'GET', token })
  return extractAccounts(res)
})

type CreateAccountPayload = {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export type CreateAccountResult = { account: BankAccount; token: string }

export const createAccount = createAsyncThunk<
  CreateAccountResult,
  CreateAccountPayload,
  { state: RootState }
>('accounts/create', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<
    BankAccount | Envelope<unknown>,
    { bank_name: string; account_number: string; account_holder: string }
  >('/accounts', {
    method: 'POST',
    token,
    body: {
      bank_name: payload.bankName,
      account_number: payload.accountNumber,
      account_holder: payload.accountHolder,
    },
  })
  const data = res && typeof res === 'object' && 'data' in res ? (res as { data?: unknown }).data : res
  const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const account = extractAccount(res)
  const tokenValue = typeof d.token === 'string' ? d.token : ''
  return { account, token: tokenValue }
})

export const refreshAccountToken = createAsyncThunk<
  { token: string },
  string,
  { state: RootState }
>('accounts/refreshToken', async (accountId, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<{ token: string } | Envelope<{ token: string }>>(
    `/accounts/${accountId}/token/refresh`,
    { method: 'POST', token }
  )
  if (res && typeof res === 'object' && 'token' in res) return { token: (res as { token: string }).token }
  const data = (res as Envelope<{ token: string }>).data
  return data ?? { token: '' }
})

type UpdateAccountPayload = { accountId: string; account_holder?: string; account_number?: string }

export const updateAccount = createAsyncThunk<
  BankAccount,
  UpdateAccountPayload,
  { state: RootState }
>('accounts/update', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const body: Record<string, string> = {}
  if (payload.account_holder !== undefined) body.account_holder = payload.account_holder
  if (payload.account_number !== undefined) body.account_number = payload.account_number
  const res = await apiFetch<BankAccount | Envelope<unknown>>(
    `/accounts/${payload.accountId}`,
    { method: 'PATCH', token, body }
  )
  if (res && typeof res === 'object' && 'id' in res) return res as BankAccount
  const data = (res as Envelope<unknown>).data
  if (data && typeof data === 'object' && 'id' in (data as object)) return data as BankAccount
  throw new Error('Invalid account response')
})

export const deleteAccount = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('accounts/delete', async (accountId, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  await apiFetch(`/accounts/${accountId}`, { method: 'DELETE', token })
})

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load accounts'
      })
      .addCase(createAccount.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.push(action.payload.account)
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to create account'
      })
      .addCase(refreshAccountToken.fulfilled, () => {})
      .addCase(refreshAccountToken.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to refresh token'
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update account'
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.meta.arg)
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete account'
      })
  },
})

export const { clearError: clearAccountsError } = accountsSlice.actions
export const accountsReducer = accountsSlice.reducer

