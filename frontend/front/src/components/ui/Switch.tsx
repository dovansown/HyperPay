import type { HTMLAttributes } from 'react'

interface SwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md'
}

export function Switch({ checked, onChange, size = 'md', className = '', ...props }: SwitchProps) {
  const sizeClasses =
    size === 'sm'
      ? 'w-10 h-6'
      : 'w-12 h-7'

  const knobClasses =
    size === 'sm'
      ? 'size-4'
      : 'size-5'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative flex items-center rounded-full px-1 transition-colors',
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10',
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span
        className={[
          'rounded-full bg-black dark:bg-white transition-transform',
          knobClasses,
          checked ? 'translate-x-full ml-[-4px]' : 'translate-x-0',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </button>
  )
}

export default Switch

