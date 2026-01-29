import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  maxWidthClassName?: string
  /**
   * Khoảng cách tối thiểu tới mép màn hình (padding overlay).
   * Modal sẽ không bao giờ lớn hơn viewport; nếu nội dung nhiều -> scroll trong body.
   */
  viewportPaddingClassName?: string
}

export function Modal({
  isOpen,
  title,
  children,
  footer,
  onClose,
  maxWidthClassName = 'max-w-[900px]',
  viewportPaddingClassName = 'p-6',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[70] bg-black/40 flex items-center justify-center ${viewportPaddingClassName}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          'w-full bg-white dark:bg-[#1c1a0e] rounded-lg shadow-2xl border border-[#e7e5da] dark:border-[#3a3622] overflow-hidden',
          maxWidthClassName,
          // không bao giờ vượt quá chiều cao viewport; nếu content nhiều -> scroll nội bộ
          // 3rem ~ p-6 top + bottom (đảm bảo không full-height)
          'max-h-[calc(100vh-3rem)]',
          'flex flex-col',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-5 border-b border-[#f5f4f0] dark:border-[#3a3622] flex items-center justify-between gap-4">
            <div className="font-bold text-[#181710] dark:text-white">{title}</div>
            <button
              type="button"
              className="size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto">{children}</div>

        {footer && (
          <div className="px-6 py-5 border-t border-[#f5f4f0] dark:border-[#3a3622]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal

