import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      className={[baseClasses, variantClasses[variant], sizeClasses[size], className]
        .filter(Boolean)
        .join(' ')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="mr-2 size-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
}

