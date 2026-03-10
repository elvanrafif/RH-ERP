import { useNavigate } from 'react-router-dom'
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

  const handleClick = () => {
    navigate(TYPE_ROUTE[project.type])
    onNavigate()
  }

  const isOverdue = project.deadlineStatus === 'overdue'
  const daysLabel = isOverdue
    ? `${Math.abs(project.daysRemaining)} hari lalu`
    : project.daysRemaining === 0
      ? 'Hari ini'
      : `${project.daysRemaining} hari lagi`

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
            isOverdue ? 'bg-red-500' : 'bg-amber-400'
          }`}
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-foreground truncate">
            {project.clientName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {TYPE_LABEL[project.type]}
            <span
              className={`ml-2 font-semibold ${
                isOverdue ? 'text-red-500' : 'text-amber-500'
              }`}
            >
              {daysLabel}
            </span>
          </p>
        </div>
      </div>
    </button>
  )
}
