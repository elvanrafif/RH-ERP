import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface GuardProps {
  require: string
  children: ReactNode
  fallback?: ReactNode // Opsional: Tampilan jika ditolak (misal gembok abu-abu)
}

export function Guard({ require, children, fallback = null }: GuardProps) {
  const { can } = useAuth()

  // Jika tidak punya izin, render fallback (defaultnya kosong/hilang)
  if (!can(require)) {
    return <>{fallback}</>
  }

  // Jika punya izin, tampilkan komponennya
  return <>{children}</>
}
