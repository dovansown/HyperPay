import React from 'react'

type VerificationCodeInputProps = {
  idPrefix?: string
  value: string[]
  length?: number
  autoFocus?: boolean
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
  error?: string | null
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  idPrefix = 'verify-digit',
  value,
  length = 6,
  autoFocus = false,
  onChange,
  onComplete,
}) => {
  const digits = value.slice(0, length).concat(Array(Math.max(0, length - value.length)).fill(''))

  const setDigits = (updater: (prev: string[]) => string[]) => {
    const next = updater(digits)
    onChange(next)
    const code = next.join('')
    if (onComplete && code.length === length) {
      onComplete(code)
    }
  }

  const handleDigitChange = (index: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1)
    if (!v && !raw) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }
    setDigits((prev) => {
      const next = [...prev]
      next[index] = v
      if (v && index < length - 1) {
        const el = document.getElementById(`${idPrefix}-${index + 1}`)
        if (el) (el as HTMLInputElement).focus()
      }
      return next
    })
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const el = document.getElementById(`${idPrefix}-${index - 1}`)
      if (el) (el as HTMLInputElement).focus()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length > 0) {
      const next = Array(length).fill('')
      pasted.split('').forEach((c, i) => {
        next[i] = c
      })
      onChange(next)
      if (pasted.length === length && onComplete) {
        onComplete(pasted)
      }
      const focusIdx = Math.min(pasted.length, length - 1)
      setTimeout(() => {
        const el = document.getElementById(`${idPrefix}-${focusIdx}`)
        if (el) (el as HTMLInputElement).focus()
      }, 0)
    }
  }

  return (
    <div
      className="flex justify-center gap-2 sm:gap-4"
      onPaste={handlePaste}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-primary focus:ring-0 transition-all outline-none text-slate-900 dark:text-slate-100"
          value={d}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </div>
  )
}

