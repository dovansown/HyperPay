import React from 'react'
import type { ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export const withAuth = <P extends object>(Wrapped: ComponentType<P>) => {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const token = useAppSelector((s) => s.auth.token)
    const location = useLocation()

    if (!token) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location }}
        />
      )
    }

    return <Wrapped {...props} />
  }

  return ComponentWithAuth
}

