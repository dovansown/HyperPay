import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch } from '../lib/apiClient'
import type { RootState } from './store'

export type BankAccount = {
  id: number
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
  if (data && typeof data === 'object' && 'id' in (data as object)) return data as BankAccount
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

export const createAccount = createAsyncThunk<
  BankAccount,
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
  return extractAccount(res)
})

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
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
        state.items.push(action.payload)
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to create account'
      })
  },
})

export const accountsReducer = accountsSlice.reducer

