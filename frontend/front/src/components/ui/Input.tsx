import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  iconLeft?: ReactNode
  helperText?: string
  error?: string
  rounded?: 'sm' | 'md' | 'full'
}

export function Input({
  label,
  iconLeft,
  helperText,
  error,
  className = '',
  rounded = 'sm',
  ...props
}: InputProps) {
  const roundedClass =
    rounded === 'full' ? 'rounded-full h-14' : rounded === 'md' ? 'rounded-lg h-12' : 'rounded-sm h-10 text-sm'

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-bold text-[#1d1a0c] dark:text-zinc-200 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a19345] flex items-center">
            {iconLeft}
          </span>
        )}
        <input
          className={[
            'form-input flex w-full text-[#1d1a0c] dark:text-zinc-100 border border-[#eae5cd] dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-12 pr-4 placeholder:text-[#a19345] transition-all outline-none',
            roundedClass,
            iconLeft ? 'pl-12' : 'pl-4',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {(helperText || error) && (
        <p
          className={`text-xs ml-1 ${
            error ? 'text-red-500' : 'text-[#5e5a40] dark:text-zinc-400'
          }`}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  )
}

export default Input

