import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  iconBg: string
  label: string
  value: ReactNode
  urgent?: boolean
}

export function StatCard({ icon, iconBg, label, value, urgent = false }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex-1 w-full p-4 flex items-center gap-4 transition-colors',
        urgent ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50/50'
      )}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
          iconBg,
          urgent && 'animate-pulse'
        )}
      >
        {icon}
      </div>
      <div className="overflow-hidden">
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-wider mb-0.5',
            urgent ? 'text-red-600' : 'text-slate-500'
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            'text-xl font-bold',
            urgent ? 'text-red-700' : 'text-slate-800'
          )}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
