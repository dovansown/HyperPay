import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  title: string
  subtitle?: string
  icon?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  /** 'small' = max-w-[480px], 'default' = max-w-[640px], 'large' = max-w-[960px] h-[640px] (layout upgrade) */
  size?: 'small' | 'default' | 'large'
  /** When true (default), body scrolls. When false, body is flex-1 min-h-0 overflow-hidden for custom layout (e.g. sidebar + main). */
  bodyScroll?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  size = 'default',
  bodyScroll = true,
}) => {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const isLarge = size === 'large'
  const isSmall = size === 'small'
  const containerClass = isLarge
    ? 'max-w-[960px] w-full h-[640px] rounded-xl shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col bg-white dark:bg-[#0a2540]'
    : isSmall
      ? 'max-w-[480px] w-full rounded-xl shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#100f23]'
      : 'max-w-[640px] w-full rounded-xl shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#100f23]'

  const headerBorder = 'border-[#e6ebf1] dark:border-slate-800'
  const footerBg = isLarge ? 'bg-[#f6f9fc] dark:bg-slate-900/50' : 'bg-slate-50/50 dark:bg-slate-900/50'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/20 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={containerClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header
          className={`flex items-center justify-between px-8 py-5 border-b ${headerBorder} bg-white dark:bg-transparent flex-shrink-0`}
        >
          <div className="flex items-center gap-4">
            {icon ? (
              <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            ) : null}
            <div>
              <h2 className="text-xl font-bold text-[#1a1f36] dark:text-slate-100">{title}</h2>
              {subtitle ? (
                <p className="text-sm text-[#697386] dark:text-slate-400 mt-0.5">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-[#f6f9fc] dark:hover:bg-slate-800 rounded-full transition-colors text-[#697386]"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div
          className={bodyScroll ? 'overflow-y-auto max-h-[80vh]' : 'flex flex-1 min-h-0 overflow-hidden'}
        >
          {children}
        </div>

        {footer ? (
          <footer
            className={`px-8 py-5 border-t ${headerBorder} ${footerBg} flex-shrink-0`}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
