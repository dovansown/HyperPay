import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { dashboardReducer } from './dashboardSlice'
import { accountsReducer } from './accountsSlice'
import { webhookReducer } from './webhookSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    accounts: accountsReducer,
    webhook: webhookReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

