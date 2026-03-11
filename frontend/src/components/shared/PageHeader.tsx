import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon?: ReactNode
  title: ReactNode
  description?: string
  action?: ReactNode
}

export function PageHeader({
  icon,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <div className="flex gap-2 items-center">
          {icon}
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
