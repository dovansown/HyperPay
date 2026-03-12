import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

type AdminModalProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export const AdminModal: React.FC<AdminModalProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
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

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onClick={onClose} role="presentation">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative h-full w-full p-4 flex items-center justify-center" role="presentation">
        <div
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
          {footer ? <div className="px-6 py-4 border-t border-slate-100">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
