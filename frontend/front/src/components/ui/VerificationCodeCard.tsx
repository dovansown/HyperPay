import React from 'react'
import { Button } from './Button'
import { VerificationCodeInput } from './VerificationCodeInput'

type VerificationCodeCardProps = {
  title: string
  description: string
  code: string[]
  onCodeChange: (value: string[]) => void
  primaryLabel: string
  loading?: boolean
  disabled?: boolean
  error?: string | null
  onSubmit: () => void
  resendLabel?: string
  onResend?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  iconName?: string
  secureText?: string
}

export const VerificationCodeCard: React.FC<VerificationCodeCardProps> = ({
  title,
  description,
  code,
  onCodeChange,
  primaryLabel,
  loading,
  disabled,
  error,
  onSubmit,
  resendLabel,
  onResend,
  secondaryLabel,
  onSecondary,
  iconName = 'stay_primary_portrait',
  secureText,
}) => {
  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (!disabled && !loading) {
      onSubmit()
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-8 md:p-10 space-y-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">{iconName}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
          {description}
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <VerificationCodeInput
          idPrefix="verify-digit"
          value={code}
          length={6}
          autoFocus
          onChange={onCodeChange}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}
        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={disabled}
            loading={loading}
          >
            {primaryLabel}
          </Button>
          {(resendLabel || secondaryLabel) && (
            <div className="flex flex-col items-center gap-2">
              {resendLabel && onResend && (
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  onClick={onResend}
                >
                  {resendLabel}
                </button>
              )}
              {secondaryLabel && onSecondary && (
                <button
                  type="button"
                  className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                  onClick={onSecondary}
                >
                  {secondaryLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </form>

      {secureText && (
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="text-[11px] uppercase tracking-widest font-semibold">
              {secureText}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

