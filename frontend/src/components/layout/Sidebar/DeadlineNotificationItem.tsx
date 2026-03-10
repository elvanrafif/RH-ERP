import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeadlineProject } from '@/lib/projects/deadline'

const TYPE_LABEL: Record<DeadlineProject['type'], string> = {
  architecture: 'Arsitektur',
  civil: 'Sipil',
  interior: 'Interior',
}

const TYPE_ROUTE: Record<DeadlineProject['type'], string> = {
  architecture: '/projects/architecture',
  civil: '/projects/civil',
  interior: '/projects/interior',
}

interface DeadlineNotificationItemProps {
  project: DeadlineProject
  onNavigate: () => void
}

export function DeadlineNotificationItem({
  project,
  onNavigate,
}: DeadlineNotificationItemProps) {
  const navigate = useNavigate()
  const isOverdue = project.deadlineStatus === 'overdue'

  const daysLabel = isOverdue
    ? `${Math.abs(project.daysRemaining)}h lalu`
    : project.daysRemaining === 0
      ? 'Hari ini'
      : `${project.daysRemaining}h lagi`

  const handleClick = () => {
    navigate(TYPE_ROUTE[project.type])
    onNavigate()
  }

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer w-full text-left relative flex items-stretch gap-0
        border-b border-border/40 last:border-0
        hover:bg-muted/50 transition-colors duration-150 group"
    >
      {/* Left accent bar */}
      <div
        className={cn(
          'w-0.5 shrink-0 rounded-full my-2 ml-3',
          isOverdue ? 'bg-red-500' : 'bg-amber-400'
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 px-3 py-2.5">
        {/* Row 1: client name + days pill */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">
            {project.clientName}
          </p>
          <span
            className={cn(
              'shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none',
              isOverdue
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-600'
            )}
          >
            {daysLabel}
          </span>
        </div>

        {/* Row 2: type · PIC */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] font-medium text-muted-foreground">
            {TYPE_LABEL[project.type]}
          </span>
          <span className="text-muted-foreground/40 text-[10px]">·</span>
          <User className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">
            {project.picName}
          </span>
        </div>
      </div>
    </button>
  )
}
