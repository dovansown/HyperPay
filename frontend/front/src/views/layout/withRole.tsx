import React from 'react'
import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

type Role = 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN'

export const withRole = <P extends object>(Wrapped: ComponentType<P>, allowedRoles: Role[]) => {
  const ComponentWithRole: React.FC<P> = (props) => {
    const user = useAppSelector((s) => s.auth.user)
    const token = useAppSelector((s) => s.auth.token)

    if (!token) {
      return <Navigate to="/login" replace />
    }
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />
    }

    return <Wrapped {...props} />
  }

  return ComponentWithRole
}
