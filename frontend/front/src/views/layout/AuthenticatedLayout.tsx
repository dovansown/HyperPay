import React from 'react'
import { AppHeader } from './AppHeader'

type AuthenticatedLayoutProps = {
  children: React.ReactNode
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <div className="font-sans bg-background-light min-h-screen text-slate-900 flex flex-col">
      <AppHeader />
      <main className="flex-1 px-6 py-8 lg:px-16">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

