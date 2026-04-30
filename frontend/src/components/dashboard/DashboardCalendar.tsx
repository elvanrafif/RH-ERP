import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg, EventClickArg } from '@fullcalendar/interaction'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardCalendarEvents } from '@/hooks/useDashboardCalendarEvents'
import { DashboardCalendarPopover } from './DashboardCalendarPopover'
import { CALENDAR_EVENT_COLORS } from '@/lib/constant'

interface PopoverState {
  date: string
  x: number
  y: number
}

const LEGEND_ITEMS = [
  { label: 'Architecture', color: CALENDAR_EVENT_COLORS.architecture },
  { label: 'Civil', color: CALENDAR_EVENT_COLORS.civil },
  { label: 'Interior', color: CALENDAR_EVENT_COLORS.interior },
  { label: 'Survey', color: CALENDAR_EVENT_COLORS.survey },
  { label: 'Meeting', color: CALENDAR_EVENT_COLORS.meeting },
] as const

export function DashboardCalendar() {
  const { events, isLoading } = useDashboardCalendarEvents()
  const [popoverState, setPopoverState] = useState<PopoverState | null>(null)

  const popoverEvents = useMemo(() => {
    if (!popoverState) return []
    return events.filter((e) => e.date === popoverState.date)
  }, [events, popoverState])

  const openPopover = (date: string, jsEvent: MouseEvent) => {
    setPopoverState({ date, x: jsEvent.clientX, y: jsEvent.clientY })
  }

  const handleDateClick = (info: DateClickArg) => {
    openPopover(info.dateStr, info.jsEvent as MouseEvent)
  }

  const handleEventClick = (info: EventClickArg) => {
    const date = info.event.startStr.split('T')[0]
    openPopover(date, info.jsEvent as MouseEvent)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoreLinkClick = (info: any) => {
    const date = info.date.toLocaleDateString('en-CA')
    openPopover(date, info.jsEvent as MouseEvent)
  }

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            Team Calendar
          </CardTitle>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {LEGEND_ITEMS.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs text-slate-600"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {isLoading ? (
          <div className="h-[500px] animate-pulse rounded-md bg-slate-100" />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek',
            }}
            buttonText={{ today: 'Today', month: 'Month', week: 'Week' }}
            events={events}
            dayMaxEvents={2}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            moreLinkClick={handleMoreLinkClick}
            height="auto"
            eventDisplay="block"
          />
        )}

        {/* Custom popover */}
        {popoverState && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPopoverState(null)}
            />
            <div
              className="fixed z-50"
              style={{
                // 300 = w-72 (288px) + 12px safety margin
                left: Math.min(popoverState.x, window.innerWidth - 300),
                // 320 = max-h-72 (288px) + 32px header clearance
                top: Math.min(popoverState.y + 10, window.innerHeight - 320),
              }}
            >
              <DashboardCalendarPopover
                date={popoverState.date}
                events={popoverEvents}
                onClose={() => setPopoverState(null)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
