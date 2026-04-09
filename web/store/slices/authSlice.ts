import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData } from '@/lib/apiClient';

type AuthUser = {
  email: string;
  fullName?: string;
  role?: 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const AUTH_STORAGE_KEY = 'hyperpay.web.auth.v1';

function loadAuthFromStorage(): Pick<AuthState, 'token' | 'user'> {
  if (typeof window === 'undefined') return { token: null, user: null };
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as { token?: unknown; user?: unknown };
    const token = typeof parsed.token === 'string' ? parsed.token : null;
    const u = parsed.user && typeof parsed.user === 'object' ? (parsed.user as Record<string, unknown>) : null;
    const email = typeof u?.email === 'string' ? u.email : null;
    const fullName = typeof u?.fullName === 'string' ? u.fullName : undefined;
    const role =
      typeof u?.role === 'string' && ['USER', 'AUTHOR', 'EDITOR', 'ADMIN'].includes(u.role)
        ? (u.role as AuthUser['role'])
        : undefined;
    return { token, user: email ? { email, fullName, role } : null };
  } catch {
    return { token: null, user: null };
  }
}

function saveAuthToStorage(next: Pick<AuthState, 'token' | 'user'>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const persisted = loadAuthFromStorage();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  status: 'idle',
  error: null,
};

type RegisterPayload = { email: string; password: string; fullName: string };
type LoginPayload = { email: string; password: string };
type ForgotPasswordPayload = { email: string };

type AuthResponse = {
  success?: boolean;
  data?: {
    token?: string;
    access_token?: string;
    jwt?: string;
    user?: {
      email?: string;
      full_name?: string;
      role?: AuthUser['role'];
    };
    needs_2fa?: boolean;
    needs_login_verify?: boolean;
  };
  token?: string;
  access_token?: string;
  jwt?: string;
  user?: {
    email?: string;
    full_name?: string;
    role?: AuthUser['role'];
  };
  needs_2fa?: boolean;
  needs_login_verify?: boolean;
};

function extractToken(payload: AuthResponse): string | undefined {
  if (payload.data?.token) return payload.data.token;
  if (payload.data?.access_token) return payload.data.access_token;
  if (payload.data?.jwt) return payload.data.jwt;
  if (payload.token) return payload.token;
  if (payload.access_token) return payload.access_token;
  if (payload.jwt) return payload.jwt;
  return undefined;
}

export const registerThunk = createAsyncThunk<AuthResponse, RegisterPayload>('auth/register', async (body) => {
  return await apiFetch<AuthResponse, { email: string; password: string; full_name: string }>('/auth/register', {
    method: 'POST',
    body: { email: body.email, password: body.password, full_name: body.fullName },
  });
});

export const loginThunk = createAsyncThunk<AuthResponse, LoginPayload>('auth/login', async (body) => {
  return await apiFetch<AuthResponse, LoginPayload>('/auth/login', { method: 'POST', body });
});

export const forgotPasswordThunk = createAsyncThunk<void, ForgotPasswordPayload>('auth/forgotPassword', async (body) => {
  await apiFetch<unknown, ForgotPasswordPayload>('/auth/forgot-password', { method: 'POST', body });
});

export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { state: { auth: AuthState } }>(
  'auth/fetchCurrentUser',
  async (_arg, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) throw new Error('No token');
    const res = await apiFetch<{ email: string; full_name: string; role?: AuthUser['role'] }>('/users/me', { token });
    const data = unwrapApiData(res);
    return { email: data.email, fullName: data.full_name, role: data.role };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      clearAuthStorage();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const token = extractToken(action.payload);
        if (token) {
          state.token = token;
          saveAuthToStorage({ token: state.token, user: state.user });
        }
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Register failed';
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = (action.payload as { data?: Record<string, unknown> })?.data ?? action.payload;
        if (data?.needs_2fa === true || data?.needs_login_verify === true) return;
        const token = extractToken(action.payload);
        if (token) {
          state.token = token;
          saveAuthToStorage({ token: state.token, user: state.user });
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Request failed';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        if (state.token) saveAuthToStorage({ token: state.token, user: state.user });
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

