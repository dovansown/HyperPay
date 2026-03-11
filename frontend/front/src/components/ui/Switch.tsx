import React from 'react'

type SwitchProps = {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled, className }) => {
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) onChange(!checked)
      }}
      className={[
        'inline-flex items-center gap-2 text-sm text-slate-700',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-slate-300',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'inline-block size-4 rounded-full bg-white shadow transform transition-transform',
            checked ? 'translate-x-4' : 'translate-x-1',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </span>
      {label && <span>{label}</span>}
    </button>
  )
}

