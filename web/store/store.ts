import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { dashboardReducer } from './slices/dashboardSlice';
import { accountsReducer } from './slices/accountsSlice';
import { banksReducer } from './slices/banksSlice';
import { webhookReducer } from './slices/webhookSlice';
import { billingReducer } from './slices/billingSlice';
import { contentReducer } from './slices/contentSlice';
import { profileReducer } from './slices/profileSlice';
import { supportReducer } from './slices/supportSlice';
import { notificationsReducer } from './slices/notificationsSlice';
import { transactionsReducer } from './slices/transactionsSlice';
import { adminUsersReducer } from './slices/admin/adminUsersSlice';
import { adminPackagesReducer } from './slices/admin/adminPackagesSlice';
import { adminBanksReducer } from './slices/admin/adminBanksSlice';
import { adminDurationsReducer } from './slices/admin/adminDurationsSlice';
import { adminUserPackagesReducer } from './slices/admin/adminUserPackagesSlice';
import { adminWebhooksReducer } from './slices/admin/adminWebhooksSlice';
import { adminTransactionsReducer } from './slices/admin/adminTransactionsSlice';
import { adminSettingsReducer } from './slices/admin/adminSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    accounts: accountsReducer,
    banks: banksReducer,
    webhook: webhookReducer,
    billing: billingReducer,
    content: contentReducer,
    profile: profileReducer,
    support: supportReducer,
    notifications: notificationsReducer,
    transactions: transactionsReducer,
    // Admin reducers
    adminUsers: adminUsersReducer,
    adminPackages: adminPackagesReducer,
    adminBanks: adminBanksReducer,
    adminDurations: adminDurationsReducer,
    adminUserPackages: adminUserPackagesReducer,
    adminWebhooks: adminWebhooksReducer,
    adminTransactions: adminTransactionsReducer,
    adminSettings: adminSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

