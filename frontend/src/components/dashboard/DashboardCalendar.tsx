import { useState, useMemo, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg, EventClickArg } from '@fullcalendar/interaction'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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

          {/* Legend — desktop */}
          <div className="hidden sm:flex flex-wrap gap-3">
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

          {/* Legend — mobile (compact) */}
          <div className="flex sm:hidden flex-wrap gap-2">
            {LEGEND_ITEMS.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1 text-[10px] text-slate-500"
              >
                <span
                  className="inline-block w-2 h-2 rounded-sm shrink-0"
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
          <div className="h-[400px] animate-pulse rounded-md bg-slate-100" />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            initialView={isMobile ? 'listMonth' : 'dayGridMonth'}
            headerToolbar={
              isMobile
                ? { left: 'prev,next today', center: 'title', right: '' }
                : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }
            }
            buttonText={{ today: 'Today', month: 'Month', week: 'Week' }}
            events={events}
            dayMaxEvents={isMobile ? undefined : 2}
            dateClick={isMobile ? undefined : handleDateClick}
            eventClick={handleEventClick}
            moreLinkClick={isMobile ? undefined : handleMoreLinkClick}
            height="auto"
            eventDisplay="block"
            noEventsText="No events this month"
          />
        )}

        {/* Desktop: Floating Popover */}
        <AnimatePresence>
          {!isMobile && popoverState && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPopoverState(null)}
              />
              <motion.div
                className="fixed z-50"
                style={{
                  left: Math.min(popoverState.x, window.innerWidth - 300),
                  top: Math.min(popoverState.y + 10, window.innerHeight - 320),
                }}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <DashboardCalendarPopover
                  date={popoverState.date}
                  events={popoverEvents}
                  onClose={() => setPopoverState(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile: Bottom Sheet */}
        <AnimatePresence>
          {isMobile && popoverState && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setPopoverState(null)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-slate-300" />
                </div>
                <DashboardCalendarPopover
                  date={popoverState.date}
                  events={popoverEvents}
                  onClose={() => setPopoverState(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
