import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

type TokenDisplayModalProps = {
  token: string
  title?: string
  message?: string
  onClose: () => void
}

export const TokenDisplayModal: React.FC<TokenDisplayModalProps> = ({
  token,
  title,
  message,
  onClose,
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {title ?? t('banks.tokenModal.title', 'API Token')}
          </h3>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
            aria-label={t('banks.tokenModal.close', 'Close')}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {message && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-3 rounded-lg bg-slate-100 text-sm font-mono text-slate-800 break-all select-all">
              {token}
            </code>
            <button
              type="button"
              className="flex-shrink-0 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              onClick={handleCopy}
              title={t('banks.tokenModal.copy', 'Copy')}
              aria-label={t('banks.tokenModal.copy', 'Copy')}
            >
              <span className="material-symbols-outlined">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600">{t('banks.tokenModal.copied', 'Copied to clipboard.')}</p>
          )}
          <button
            type="button"
            className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90"
            onClick={onClose}
          >
            {t('banks.tokenModal.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  )
}
