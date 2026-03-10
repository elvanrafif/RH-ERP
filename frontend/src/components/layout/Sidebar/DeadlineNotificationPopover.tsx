import { Bell } from 'lucide-react'
import type { DeadlineProject } from '@/lib/projects/deadline'
import { DeadlineNotificationItem } from './DeadlineNotificationItem'

interface DeadlineNotificationPopoverProps {
  deadlineProjects: DeadlineProject[]
  overdueCount: number
  warningCount: number
  onClose: () => void
}

export function DeadlineNotificationPopover({
  deadlineProjects,
  overdueCount,
  warningCount,
  onClose,
}: DeadlineNotificationPopoverProps) {
  if (deadlineProjects.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-2 text-muted-foreground">
        <Bell className="h-8 w-8 opacity-30" />
        <p className="text-sm">Tidak ada deadline mendekat</p>
      </div>
    )
  }

  const overdue = deadlineProjects.filter((p) => p.deadlineStatus === 'overdue')
  const warning = deadlineProjects.filter((p) => p.deadlineStatus === 'warning')

  return (
    <div>
      {/* Summary bar */}
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-3 text-xs text-muted-foreground">
        {overdueCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
            <span className="text-red-500 font-semibold">{overdueCount} overdue</span>
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-500 font-semibold">{warningCount} segera</span>
          </span>
        )}
      </div>

      {/* Overdue section */}
      {overdue.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
            Overdue
          </p>
          {overdue.map((p) => (
            <DeadlineNotificationItem key={p.id} project={p} onNavigate={onClose} />
          ))}
        </div>
      )}

      {/* Warning section */}
      {warning.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
            Segera Deadline
          </p>
          {warning.map((p) => (
            <DeadlineNotificationItem key={p.id} project={p} onNavigate={onClose} />
          ))}
        </div>
      )}
    </div>
  )
}
