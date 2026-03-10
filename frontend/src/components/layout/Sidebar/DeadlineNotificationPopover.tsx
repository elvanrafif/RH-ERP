import { useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeadlineProject } from '@/lib/projects/deadline'
import { DeadlineNotificationItem } from './DeadlineNotificationItem'

type ActiveTab = 'overdue' | 'upcoming'

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('overdue')

  const overdue = deadlineProjects.filter((p) => p.deadlineStatus === 'overdue')
  const upcoming = deadlineProjects.filter((p) => p.deadlineStatus === 'warning')
  const visibleItems = activeTab === 'overdue' ? overdue : upcoming

  if (deadlineProjects.length === 0) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-2 text-muted-foreground">
        <Bell className="h-7 w-7 opacity-25" />
        <p className="text-sm font-medium">No upcoming deadlines</p>
        <p className="text-xs text-muted-foreground/60">All projects are on track</p>
      </div>
    )
  }

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('overdue')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer',
            activeTab === 'overdue'
              ? 'text-red-600 border-b-2 border-red-500 bg-red-50/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          Overdue
          {overdueCount > 0 && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold',
              activeTab === 'overdue'
                ? 'bg-red-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}>
              {overdueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer',
            activeTab === 'upcoming'
              ? 'text-amber-600 border-b-2 border-amber-400 bg-amber-50/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          Upcoming
          {warningCount > 0 && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold',
              activeTab === 'upcoming'
                ? 'bg-amber-400 text-white'
                : 'bg-muted text-muted-foreground'
            )}>
              {warningCount}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable list */}
      <div className="max-h-[320px] overflow-y-auto overscroll-contain">
        {visibleItems.length === 0 ? (
          <div className="py-8 flex flex-col items-center gap-1.5 text-muted-foreground">
            <p className="text-sm font-medium">
              {activeTab === 'overdue' ? 'No overdue projects' : 'No upcoming deadlines'}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {activeTab === 'overdue'
                ? 'All projects are within their deadline'
                : 'No projects due within 7 days'}
            </p>
          </div>
        ) : (
          visibleItems.map((p) => (
            <DeadlineNotificationItem key={p.id} project={p} onNavigate={onClose} />
          ))
        )}
      </div>
    </div>
  )
}
