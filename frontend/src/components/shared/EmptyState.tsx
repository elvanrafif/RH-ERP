import type { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-4">
      <div className="bg-slate-100 p-4 rounded-full">
        {icon ?? <FolderOpen className="h-8 w-8 text-slate-400" />}
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
