import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface PermissionGuardProps {
  require?: string
  requireAny?: string[]
}

export function PermissionGuard({ require, requireAny }: PermissionGuardProps) {
  const { can, isLoading } = useAuth()

  // Wait for AuthProvider to finish fetching user data from PocketBase
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  if (process.env.NODE_ENV === 'development') {
    if (!require && !requireAny) {
      console.error(
        'PermissionGuard: either "require" or "requireAny" must be provided'
      )
    }
    if (require && requireAny) {
      console.error(
        'PermissionGuard: "require" and "requireAny" are mutually exclusive. "require" will take precedence.'
      )
    }
    if (requireAny && requireAny.length === 0) {
      console.error(
        'PermissionGuard: "requireAny" was passed an empty array — access will always be denied.'
      )
    }
  }

  // Single permission check (require) or multi-permission OR check (requireAny)
  const hasAccess = require
    ? can(require)
    : requireAny
      ? requireAny.some((p) => can(p))
      : false

  // If the user doesn't have permission, kick them back to the Dashboard
  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  // If they have permission, render the child routes
  return <Outlet />
}
