import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
}

export function Card({
  header,
  footer,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-[#2d2a15] rounded-lg border border-[#e9e5ce] dark:border-[#4a452a] shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {header && <div className="px-6 pt-6 pb-4 border-b border-black/5 dark:border-white/5">{header}</div>}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 pb-6 pt-4 border-t border-black/5 dark:border-white/5">{footer}</div>}
    </div>
  )
}

export default Card

