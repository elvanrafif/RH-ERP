import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface GuardProps {
  require?: string
  requireAny?: string[]
  children: ReactNode
  fallback?: ReactNode // Opsional: Tampilan jika ditolak (misal gembok abu-abu)
}

export function Guard({
  require,
  requireAny,
  children,
  fallback = null,
}: GuardProps) {
  const { can } = useAuth()

  // Single permission check (require) or multi-permission OR check (requireAny)
  const hasAccess = require
    ? can(require)
    : requireAny
      ? requireAny.some((p) => can(p))
      : false

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
