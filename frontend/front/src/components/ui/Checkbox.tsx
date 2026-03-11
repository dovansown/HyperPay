import React from 'react'

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...rest }) => {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className={['w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary', className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {label && <span>{label}</span>}
    </label>
  )
}

