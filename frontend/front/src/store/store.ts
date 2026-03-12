import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { dashboardReducer } from './dashboardSlice'
import { accountsReducer } from './accountsSlice'
import { webhookReducer } from './webhookSlice'
import { transactionsReducer } from './transactionsSlice'
import { billingReducer } from './billingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    accounts: accountsReducer,
    webhook: webhookReducer,
    transactions: transactionsReducer,
    billing: billingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

