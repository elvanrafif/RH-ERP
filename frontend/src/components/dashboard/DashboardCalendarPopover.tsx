import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateLong } from '@/lib/helpers'
import { PROJECT_TYPE_COLORS } from '@/lib/constant'
import type { CalendarEvent } from '@/hooks/useDashboardCalendarEvents'

const EVENT_TYPE_LABEL: Record<
  CalendarEvent['extendedProps']['eventType'],
  string
> = {
  architecture: 'Architecture Deadline',
  civil: 'Civil Deadline',
  interior: 'Interior Deadline',
  survey: 'Survey',
  meeting: 'Prospect Meeting',
}

interface DashboardCalendarPopoverProps {
  date: string
  events: CalendarEvent[]
  onClose: () => void
}

export function DashboardCalendarPopover({
  date,
  events,
  onClose,
}: DashboardCalendarPopoverProps) {
  return (
    <div className="w-72 rounded-lg border bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {formatDateLong(date)}
          </p>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Event list */}
      <div className="divide-y max-h-72 overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">
            No events on this day
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="px-4 py-3 flex items-start gap-3">
              <div
                className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: event.backgroundColor }}
              />
              <div className="min-w-0">
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md border mb-1',
                    PROJECT_TYPE_COLORS[event.extendedProps.eventType]
                  )}
                >
                  {EVENT_TYPE_LABEL[event.extendedProps.eventType]}
                </span>
                <p className="text-sm font-medium text-slate-800 truncate">
                  {event.extendedProps.clientName}
                </p>
                {event.extendedProps.assignee && (
                  <p className="text-xs text-muted-foreground truncate">
                    {event.extendedProps.assignee}
                    {event.extendedProps.time &&
                      ` · ${event.extendedProps.time}`}
                  </p>
                )}
                {!event.extendedProps.assignee && event.extendedProps.time && (
                  <p className="text-xs text-muted-foreground">
                    {event.extendedProps.time}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
