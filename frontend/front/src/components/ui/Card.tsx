import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={['bg-white rounded-xl border border-slate-200 shadow-sm', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={['p-6 border-b border-slate-100 flex items-center justify-between', className]
    .filter(Boolean)
    .join(' ')}
  >
    {children}
  </div>
)

type CardBodyProps = {
  children: React.ReactNode
  className?: string
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={['p-6', className].filter(Boolean).join(' ')}>{children}</div>
)

