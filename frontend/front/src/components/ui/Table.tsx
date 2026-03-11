import React from 'react'

type TableProps = {
  children: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">{children}</table>
  </div>
)

