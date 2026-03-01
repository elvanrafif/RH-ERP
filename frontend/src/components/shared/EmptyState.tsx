import type { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-muted-foreground">
      <div className="bg-slate-50 p-4 rounded-full mb-3">
        {icon ?? <FolderOpen className="h-8 w-8 text-slate-400" />}
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mt-1 text-center">{description}</p>
      )}
    </div>
  )
}
