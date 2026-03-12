import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../lib/apiClient'
import type { RootState } from './store'

export type TransactionAccount = {
  id: number
  bank_name: string
  account_number: string
  account_holder: string
}

export type TransactionItem = {
  id: number
  amount: number
  type: string
  description: string
  payment_code: string
  balance: number
  occurred_at: string
}

type TransactionsState = {
  accounts: TransactionAccount[]
  selectedAccountId: number | null
  items: TransactionItem[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TransactionsState = {
  accounts: [],
  selectedAccountId: null,
  items: [],
  status: 'idle',
  error: null,
}

export const fetchTransactionAccounts = createAsyncThunk<
  TransactionAccount[],
  void,
  { state: RootState }
>('transactions/fetchAccounts', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<TransactionAccount[] | ApiEnvelope<TransactionAccount[]>>('/accounts', {
    method: 'GET',
    token,
  })
  return unwrapApiData<TransactionAccount[]>(res)
})

export const fetchTransactionsByAccount = createAsyncThunk<
  TransactionItem[],
  number,
  { state: RootState }
>('transactions/fetchByAccount', async (accountId, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined
  const res = await apiFetch<TransactionItem[] | ApiEnvelope<TransactionItem[]>>(
    `/accounts/${accountId}/transactions`,
    {
      method: 'GET',
      token,
    },
  )
  return unwrapApiData<TransactionItem[]>(res)
})

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setSelectedAccountId(state, action: { payload: number | null }) {
      state.selectedAccountId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionAccounts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactionAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accounts = action.payload
        if (state.selectedAccountId == null && action.payload.length > 0) {
          state.selectedAccountId = action.payload[0].id
        }
      })
      .addCase(fetchTransactionAccounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load accounts'
      })
      .addCase(fetchTransactionsByAccount.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactionsByAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTransactionsByAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load transactions'
      })
  },
})

export const { setSelectedAccountId } = transactionsSlice.actions
export const transactionsReducer = transactionsSlice.reducer
