import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, unwrapApiData, type ApiEnvelope } from '@/lib/apiClient';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

interface RateLimitConfig {
  loginAttempts: number;
  loginWindowSeconds: number;
  emailPerUserPerHour: number;
}

interface NotificationDefaults {
  success: boolean;
  failed: boolean;
  disputes: boolean;
  payouts: boolean;
  team: boolean;
}

interface SystemSettings {
  smtp_config: SmtpConfig;
  rate_limit: RateLimitConfig;
  alert_level: 'require_verify' | 'warn_only';
  notification_defaults: NotificationDefaults;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activePackages: number;
  totalTransactions: number;
  activeWebhooks: number;
}

export interface AdminActivityItem {
  id: string;
  type: 'user' | 'transaction' | 'webhook' | 'package';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  activities: AdminActivityItem[];
}

interface AdminListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

interface DashboardUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface DashboardPackage {
  id: string;
  status: string;
}

interface DashboardTransaction {
  id: string;
  occurred_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
  amount: number;
  type: string;
}

interface DashboardWebhook {
  id: string;
  created_at: string;
  is_active: boolean;
  user?: {
    email: string;
    full_name: string | null;
  };
  url: string;
}

const formatRelativeTime = (value: string) => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return value;
  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const buildDashboardData = (
  users: AdminListResponse<DashboardUser>,
  packages: AdminListResponse<DashboardPackage>,
  transactions: AdminListResponse<DashboardTransaction>,
  webhooks: AdminListResponse<DashboardWebhook>
): AdminDashboardData => {
  const activities: AdminActivityItem[] = [
    ...users.items.slice(0, 4).map((user) => ({
      id: `user-${user.id}`,
      type: 'user' as const,
      description: 'Người dùng mới đăng ký',
      timestamp: formatRelativeTime(user.created_at),
      user: {
        name: user.full_name || 'Chưa cập nhật',
        email: user.email,
      },
    })),
    ...transactions.items.slice(0, 4).map((transaction) => ({
      id: `transaction-${transaction.id}`,
      type: 'transaction' as const,
      description: `Giao dịch ${transaction.type === 'IN' ? 'tiền vào' : 'tiền ra'} ${Math.abs(transaction.amount).toLocaleString('vi-VN')}đ`,
      timestamp: formatRelativeTime(transaction.occurred_at),
      user: transaction.user
        ? {
            name: transaction.user.full_name || 'Chưa cập nhật',
            email: transaction.user.email,
          }
        : undefined,
    })),
    ...webhooks.items.slice(0, 4).map((webhook) => ({
      id: `webhook-${webhook.id}`,
      type: 'webhook' as const,
      description: `Webhook ${webhook.is_active ? 'đang hoạt động' : 'đã tắt'}: ${webhook.url}`,
      timestamp: formatRelativeTime(webhook.created_at),
      user: webhook.user
        ? {
            name: webhook.user.full_name || 'Chưa cập nhật',
            email: webhook.user.email,
          }
        : undefined,
    })),
  ]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(0, 8);

  return {
    stats: {
      totalUsers: users.total,
      activePackages: packages.items.filter((item) => item.status === 'ACTIVE').length,
      totalTransactions: transactions.total,
      activeWebhooks: webhooks.items.filter((item) => item.is_active).length,
    },
    activities,
  };
};

export const fetchAdminDashboard = createAsyncThunk(
  'adminSettings/fetchDashboard',
  async (_, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const [usersRes, packagesRes, transactionsRes, webhooksRes] = await Promise.all([
      apiFetch<AdminListResponse<DashboardUser> | ApiEnvelope<AdminListResponse<DashboardUser>>>(
        '/admin/users?limit=5&offset=0',
        { token }
      ),
      apiFetch<AdminListResponse<DashboardPackage> | ApiEnvelope<AdminListResponse<DashboardPackage>>>(
        '/admin/packages?limit=100&offset=0',
        { token }
      ),
      apiFetch<AdminListResponse<DashboardTransaction> | ApiEnvelope<AdminListResponse<DashboardTransaction>>>(
        '/admin/transactions?limit=5&offset=0',
        { token }
      ),
      apiFetch<AdminListResponse<DashboardWebhook> | ApiEnvelope<AdminListResponse<DashboardWebhook>>>(
        '/admin/webhooks?limit=100&offset=0',
        { token }
      ),
    ]);

    return buildDashboardData(
      unwrapApiData(usersRes),
      unwrapApiData(packagesRes),
      unwrapApiData(transactionsRes),
      unwrapApiData(webhooksRes)
    );
  }
);

interface DashboardState {
  data: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
}

interface AdminSettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  dashboard: DashboardState;
}

interface UpdateSystemSettingsInput {
  smtp_config?: Partial<SmtpConfig>;
  rate_limit?: Partial<RateLimitConfig>;
  alert_level?: 'require_verify' | 'warn_only';
  notification_defaults?: Partial<NotificationDefaults>;
}

const initialState: AdminSettingsState = {
  settings: null,
  loading: false,
  error: null,
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
};

export const fetchSystemSettings = createAsyncThunk(
  'adminSettings/fetchSettings',
  async (_, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<SystemSettings | ApiEnvelope<SystemSettings>>('/admin/system-settings', { token });

    return unwrapApiData(response);
  }
);

export const updateSystemSettings = createAsyncThunk(
  'adminSettings/updateSettings',
  async (data: UpdateSystemSettingsInput, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) throw new Error('No token');

    const response = await apiFetch<SystemSettings | ApiEnvelope<SystemSettings>>('/admin/system-settings', {
      method: 'PUT',
      body: data,
      token,
    });

    return unwrapApiData(response);
  }
);

export const refreshAdminSettingsAndDashboard = createAsyncThunk(
  'adminSettings/refreshAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchSystemSettings()).unwrap(),
      dispatch(fetchAdminDashboard()).unwrap(),
    ]);
  }
);

const adminSettingsSlice = createSlice({
  name: 'adminSettings',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
      state.dashboard.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(updateSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update settings';
      })
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.error.message || 'Failed to fetch dashboard';
      });
  },
});

export const { clearError } = adminSettingsSlice.actions;
export const adminSettingsReducer = adminSettingsSlice.reducer;
