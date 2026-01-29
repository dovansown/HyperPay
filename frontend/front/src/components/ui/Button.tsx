import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const baseClasses =
  'inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed'

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-[#1c1a0d] shadow-lg shadow-primary/30 hover:brightness-105 active:scale-[0.98]',
  secondary:
    'bg-[#f4f2e6] dark:bg-[#3a3620] text-[#1c1a0d] dark:text-white border border-[#e9e5ce] dark:border-[#4a452a] hover:bg-white/80 dark:hover:bg-black/40',
  ghost:
    'bg-transparent text-[#1c1a0d] dark:text-white hover:bg-white/10 dark:hover:bg-white/10',
  outline:
    'bg-transparent border border-[#e9e5ce] dark:border-[#4a452a] text-[#1c1a0d] dark:text-white hover:bg-white/5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  )
}

export default Button

