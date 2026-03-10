import { useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDeadlineProjects } from '@/hooks/useDeadlineProjects'
import { DeadlineNotificationPopover } from './DeadlineNotificationPopover'

interface DeadlineNotificationBellProps {
  collapsed: boolean
}

export function DeadlineNotificationBell({ collapsed }: DeadlineNotificationBellProps) {
  const [open, setOpen] = useState(false)
  const { deadlineProjects, overdueCount, warningCount, totalCount } =
    useDeadlineProjects()

  const hasOverdue = overdueCount > 0
  const badgeColor = hasOverdue ? 'bg-red-500' : 'bg-amber-400'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'relative flex items-center gap-2.5 rounded-lg transition-colors',
            'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed
              ? 'justify-center h-9 w-9 mx-auto'
              : 'w-full px-3 py-2 text-sm font-medium'
          )}
          title="Deadline Notifications"
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Notifikasi</span>}

          {/* Badge */}
          {totalCount > 0 && (
            <span
              className={cn(
                'flex items-center justify-center rounded-full text-white font-bold leading-none',
                badgeColor,
                collapsed
                  ? 'absolute -top-0.5 -right-0.5 h-4 w-4 text-[9px]'
                  : 'ml-auto h-5 min-w-5 px-1 text-[10px]'
              )}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="p-0 w-72 shadow-lg overflow-hidden"
      >
        {/* Popover header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
          <Bell className="h-4 w-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Deadline Alert</h3>
          {totalCount > 0 && (
            <span className={cn('ml-auto text-xs font-bold text-white rounded-full px-1.5 py-0.5', badgeColor)}>
              {totalCount}
            </span>
          )}
        </div>

        <DeadlineNotificationPopover
          deadlineProjects={deadlineProjects}
          overdueCount={overdueCount}
          warningCount={warningCount}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
