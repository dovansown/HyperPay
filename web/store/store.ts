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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

