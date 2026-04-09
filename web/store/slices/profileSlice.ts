import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData } from '@/lib/apiClient';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  email_verified: boolean;
  totp_enabled: boolean;
};

type TwoFASetup = {
  secret: string;
  qrUrl: string;
  qrDataUrl: string;
};

type ProfileState = {
  profile: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null;

  passwordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  passwordError: string | null;
  lastPasswordVerificationId: string | null;

  twoFASetup: TwoFASetup | null;
  twoFAStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  twoFAError: string | null;
  lastBackupCodes: string[] | null;
};

const initialState: ProfileState = {
  profile: null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
  passwordStatus: 'idle',
  passwordError: null,
  lastPasswordVerificationId: null,
  twoFASetup: null,
  twoFAStatus: 'idle',
  twoFAError: null,
  lastBackupCodes: null,
};

export const fetchProfile = createAsyncThunk<UserProfile, void, { state: { auth: { token: string | null } } }>(
  'profile/fetchProfile',
  async (_arg, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) throw new Error('No token');
    const res = await apiFetch<UserProfile>('/users/me', { token });
    return unwrapApiData(res);
  }
);

export const updateProfileThunk = createAsyncThunk<
  UserProfile,
  { full_name: string },
  { state: { auth: { token: string | null } } }
>('profile/updateProfile', async (body, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<UserProfile, { full_name: string }>('/users/me', { token, method: 'PATCH', body });
  return unwrapApiData(res);
});

export const sendVerifyEmailCodeThunk = createAsyncThunk<
  { verification_id: string },
  void,
  { state: { auth: { token: string | null } } }
>('profile/sendVerifyEmail', async (_arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ verification_id: string }>('/users/me/email/send-verification', { token, method: 'POST' });
  return unwrapApiData(res);
});

export const checkChangePasswordThunk = createAsyncThunk<
  { valid: boolean },
  { current_password: string; new_password: string },
  { state: { auth: { token: string | null } } }
>('profile/checkChangePassword', async (body, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ valid: boolean }, typeof body>('/users/me/change-password/check', { token, method: 'POST', body });
  return unwrapApiData(res);
});

export const sendChangePasswordCodeThunk = createAsyncThunk<
  { verification_id: string; expires_at?: string },
  void,
  { state: { auth: { token: string | null } } }
>('profile/sendChangePasswordCode', async (_arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ verification_id: string; expires_at?: string }>(
    '/users/me/change-password/send-code',
    { token, method: 'POST' }
  );
  return unwrapApiData(res);
});

export const changePasswordThunk = createAsyncThunk<
  { success: true },
  { verification_id: string; code: string; current_password: string; new_password: string },
  { state: { auth: { token: string | null } } }
>('profile/changePassword', async (body, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ success: true }, typeof body>('/users/me/change-password', { token, method: 'POST', body });
  return unwrapApiData(res);
});

export const get2FASetupThunk = createAsyncThunk<TwoFASetup | null, void, { state: { auth: { token: string | null } } }>(
  'profile/get2FASetup',
  async (_arg, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) throw new Error('No token');
    const res = await apiFetch<TwoFASetup | null>('/users/me/2fa/setup', { token });
    return unwrapApiData(res);
  }
);

export const enable2FAThunk = createAsyncThunk<
  { backupCodes: string[] },
  { code: string },
  { state: { auth: { token: string | null } } }
>('profile/enable2FA', async (body, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ backupCodes: string[] }, { code: string }>('/users/me/2fa/confirm', {
    token,
    method: 'POST',
    body,
  });
  return unwrapApiData(res);
});

export const disable2FAThunk = createAsyncThunk<
  { success: true },
  void,
  { state: { auth: { token: string | null } } }
>('profile/disable2FA', async (_arg, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error('No token');
  const res = await apiFetch<{ success: true }>('/users/me/2fa/disable', { token, method: 'POST' });
  return unwrapApiData(res);
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
      state.updateError = null;
      state.passwordError = null;
      state.twoFAError = null;
    },
    clearBackupCodes(state) {
      state.lastBackupCodes = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Fetch profile failed';
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message ?? 'Update profile failed';
      })
      .addCase(checkChangePasswordThunk.pending, (state) => {
        state.passwordStatus = 'loading';
        state.passwordError = null;
      })
      .addCase(checkChangePasswordThunk.fulfilled, (state) => {
        state.passwordStatus = 'succeeded';
      })
      .addCase(checkChangePasswordThunk.rejected, (state, action) => {
        state.passwordStatus = 'failed';
        state.passwordError = action.error.message ?? 'Password check failed';
      })
      .addCase(sendChangePasswordCodeThunk.pending, (state) => {
        state.passwordStatus = 'loading';
        state.passwordError = null;
      })
      .addCase(sendChangePasswordCodeThunk.fulfilled, (state, action) => {
        state.passwordStatus = 'succeeded';
        state.lastPasswordVerificationId = action.payload.verification_id;
      })
      .addCase(sendChangePasswordCodeThunk.rejected, (state, action) => {
        state.passwordStatus = 'failed';
        state.passwordError = action.error.message ?? 'Send code failed';
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.passwordStatus = 'loading';
        state.passwordError = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.passwordStatus = 'succeeded';
        state.lastPasswordVerificationId = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.passwordStatus = 'failed';
        state.passwordError = action.error.message ?? 'Change password failed';
      })
      .addCase(get2FASetupThunk.pending, (state) => {
        state.twoFAStatus = 'loading';
        state.twoFAError = null;
      })
      .addCase(get2FASetupThunk.fulfilled, (state, action) => {
        state.twoFAStatus = 'succeeded';
        state.twoFASetup = action.payload;
      })
      .addCase(get2FASetupThunk.rejected, (state, action) => {
        state.twoFAStatus = 'failed';
        state.twoFAError = action.error.message ?? '2FA setup failed';
      })
      .addCase(enable2FAThunk.pending, (state) => {
        state.twoFAStatus = 'loading';
        state.twoFAError = null;
      })
      .addCase(enable2FAThunk.fulfilled, (state, action) => {
        state.twoFAStatus = 'succeeded';
        state.lastBackupCodes = action.payload.backupCodes;
        if (state.profile) state.profile.totp_enabled = true;
      })
      .addCase(enable2FAThunk.rejected, (state, action) => {
        state.twoFAStatus = 'failed';
        state.twoFAError = action.error.message ?? 'Enable 2FA failed';
      })
      .addCase(disable2FAThunk.pending, (state) => {
        state.twoFAStatus = 'loading';
        state.twoFAError = null;
      })
      .addCase(disable2FAThunk.fulfilled, (state) => {
        state.twoFAStatus = 'succeeded';
        state.twoFASetup = null;
        state.lastBackupCodes = null;
        if (state.profile) state.profile.totp_enabled = false;
      })
      .addCase(disable2FAThunk.rejected, (state, action) => {
        state.twoFAStatus = 'failed';
        state.twoFAError = action.error.message ?? 'Disable 2FA failed';
      });
  },
});

export const { clearProfileError, clearBackupCodes } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;

