import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, hint, error, id, className, ...rest }) => {
  const inputId = id ?? rest.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          error ? 'border-red-300' : 'border-slate-200',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

