import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';
import type { RootState } from '@/store/store';

export type BankAccount = {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  created_at?: string;
};

type AccountsState = {
  items: BankAccount[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastRefreshedTokenByAccountId: Record<string, string | undefined>;
};

const initialState: AccountsState = {
  items: [],
  status: 'idle',
  error: null,
  lastRefreshedTokenByAccountId: {},
};

export const fetchAccounts = createAsyncThunk<BankAccount[], void, { state: RootState }>(
  'accounts/fetch',
  async (_, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<BankAccount[] | ApiEnvelope<BankAccount[]>>('/accounts', { method: 'GET', token });
    const data = unwrapApiData(res);
    return Array.isArray(data) ? data : [];
  }
);

type CreateAccountPayload = { bank_name: string; account_number: string; account_holder: string };
type CreateAccountResponse = { account: BankAccount; token: string } | BankAccount;

export const createAccount = createAsyncThunk<CreateAccountResponse, CreateAccountPayload, { state: RootState }>(
  'accounts/create',
  async (body, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<CreateAccountResponse | ApiEnvelope<CreateAccountResponse>, CreateAccountPayload>('/accounts', {
      method: 'POST',
      token,
      body,
    });
    return unwrapApiData(res);
  }
);

export const refreshAccountToken = createAsyncThunk<{ accountId: string; token: string }, string, { state: RootState }>(
  'accounts/refreshToken',
  async (accountId, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<{ token: string } | ApiEnvelope<{ token: string }>>(`/accounts/${accountId}/token/refresh`, {
      method: 'POST',
      token,
    });
    const data = unwrapApiData(res);
    return { accountId, token: data.token };
  }
);

type UpdateAccountPayload = { accountId: string; bank_name?: string; account_number?: string; account_holder?: string };

export const updateAccount = createAsyncThunk<BankAccount, UpdateAccountPayload, { state: RootState }>(
  'accounts/update',
  async ({ accountId, ...body }, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    const res = await apiFetch<BankAccount | ApiEnvelope<BankAccount>, Omit<UpdateAccountPayload, 'accountId'>>(`/accounts/${accountId}`, {
      method: 'PATCH',
      token,
      body,
    });
    return unwrapApiData(res);
  }
);

export const deleteAccount = createAsyncThunk<string, string, { state: RootState }>(
  'accounts/delete',
  async (accountId, thunkApi) => {
    const token = thunkApi.getState().auth.token ?? undefined;
    await apiFetch(`/accounts/${accountId}`, {
      method: 'DELETE',
      token,
    });
    return accountId;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountsError(state) {
      state.error = null;
    },
    clearRefreshedToken(state, action: { payload: string }) {
      delete state.lastRefreshedTokenByAccountId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load accounts';
      })
      .addCase(createAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload as unknown;
        // API create trả { account, token } (theo be/api.http) hoặc trả thẳng account
        if (payload && typeof payload === 'object' && 'account' in (payload as object)) {
          const account = (payload as { account: BankAccount }).account;
          state.items.unshift(account);
          const tokenValue = (payload as { token?: unknown }).token;
          if (typeof tokenValue === 'string' && tokenValue) {
            state.lastRefreshedTokenByAccountId[account.id] = tokenValue;
          }
        } else {
          const account = payload as BankAccount;
          if (account?.id) state.items.unshift(account);
        }
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to create account';
      })
      .addCase(refreshAccountToken.fulfilled, (state, action) => {
        state.lastRefreshedTokenByAccountId[action.payload.accountId] = action.payload.token;
      })
      .addCase(refreshAccountToken.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to refresh token';
      })
      .addCase(updateAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to update account';
      })
      .addCase(deleteAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
        delete state.lastRefreshedTokenByAccountId[action.payload];
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to delete account';
      });
  },
});

export const { clearAccountsError, clearRefreshedToken } = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;