import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export function Table({ className = '', ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#eae5cd] dark:border-white/10 bg-white dark:bg-white/5">
      <table
        className={['w-full border-collapse text-sm', className].filter(Boolean).join(' ')}
        {...props}
      />
    </div>
  )
}

export function Thead({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={[
        'bg-[#fcfbf8] dark:bg-white/5 border-b border-[#eae5cd] dark:border-white/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function Tbody({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={['divide-y divide-[#eae5cd] dark:divide-white/10', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function Th({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        'px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#a19345] text-left',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function Td({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={['px-6 py-5 align-middle', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export default {
  Table,
  Thead,
  Tbody,
  Th,
  Td,
}

