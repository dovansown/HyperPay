import React from 'react'
import { PublicFooter } from './PublicFooter'
import { LandingHeader } from '../landing/LandingHeader'

type PublicLayoutProps = {
  children: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light font-sans text-slate-900 flex flex-col">
      <LandingHeader variant="public" />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  )
}

