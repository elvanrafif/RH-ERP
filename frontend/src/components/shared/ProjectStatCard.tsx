import type { ReactNode } from 'react'

const colorMap = {
  emerald: {
    border: 'border-emerald-100',
    icon: 'text-emerald-500',
    label: 'text-emerald-600',
  },
  blue: {
    border: 'border-blue-100',
    icon: 'text-blue-500',
    label: 'text-blue-600',
  },
  amber: {
    border: 'border-amber-100',
    icon: 'text-amber-500',
    label: 'text-amber-600',
  },
}

interface ProjectStatCardProps {
  icon: ReactNode
  label: string
  color: keyof typeof colorMap
  value: ReactNode
  description: string
  className?: string
}

export function ProjectStatCard({
  icon,
  label,
  color,
  value,
  description,
  className,
}: ProjectStatCardProps) {
  const c = colorMap[color]
  return (
    <div
      className={`bg-white border ${c.border} rounded-xl shadow-sm px-4 py-3 md:px-5 md:py-4 flex-1 min-w-0 flex flex-row items-center gap-3 md:flex-col md:items-stretch md:gap-0 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 md:mb-3 shrink-0">
        <span className={`${c.icon} shrink-0 [&>svg]:h-4 [&>svg]:w-4`}>
          {icon}
        </span>
        <span className={`text-xs font-semibold ${c.label} uppercase tracking-wider`}>
          {label}
        </span>
      </div>
      <div
        className="md:mb-3 ml-auto md:ml-0"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value}
      </div>
      <div className="hidden md:block border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
