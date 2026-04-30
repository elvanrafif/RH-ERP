import { useMemo } from 'react'
import { format } from 'date-fns'
import { useProjects } from './useProjects'
import { useProspects } from './useProspects'
import { useSurveys } from './useSurveys'
import { CALENDAR_EVENT_COLORS, DONE_STATUSES } from '@/lib/constant'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    eventType: 'architecture' | 'civil' | 'interior' | 'survey' | 'meeting'
    clientName: string
    assignee?: string
    time?: string
  }
}

/** Ambil YYYY-MM-DD dari date string (ISO date atau ISO datetime), dalam timezone lokal */
function toDateStr(dateStr: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  return format(new Date(dateStr), 'yyyy-MM-dd')
}

/** Ambil HH:mm dari ISO datetime string. Undefined jika hanya date. */
function toTimeStr(dateStr: string): string | undefined {
  if (!dateStr || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined
  return format(new Date(dateStr), 'HH:mm')
}

export function useDashboardCalendarEvents() {
  const { projects: archProjects, isLoading: archLoading } = useProjects({
    projectType: 'architecture',
    statusFilter: 'all',
  })
  const { projects: civilProjects, isLoading: civilLoading } = useProjects({
    projectType: 'civil',
    statusFilter: 'all',
  })
  const { projects: interiorProjects, isLoading: interiorLoading } = useProjects({
    projectType: 'interior',
    statusFilter: 'all',
  })
  const { prospects, isLoading: prospectsLoading } = useProspects()
  const { surveys, isLoading: surveysLoading } = useSurveys()

  const isLoading =
    archLoading || civilLoading || interiorLoading || prospectsLoading || surveysLoading

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = []
    const color = CALENDAR_EVENT_COLORS

    for (const p of archProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline) continue
      result.push({
        id: `arch-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Architecture',
        date: toDateStr(p.deadline),
        backgroundColor: color.architecture,
        borderColor: color.architecture,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'architecture',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const p of civilProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.end_date) continue
      result.push({
        id: `civil-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Civil',
        date: toDateStr(p.end_date),
        backgroundColor: color.civil,
        borderColor: color.civil,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'civil',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const p of interiorProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline) continue
      result.push({
        id: `int-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Interior',
        date: toDateStr(p.deadline),
        backgroundColor: color.interior,
        borderColor: color.interior,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'interior',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const s of surveys) {
      if (!s.schedule) continue
      result.push({
        id: `survey-${s.id}`,
        title: s.expand?.client?.company_name ?? 'Survey',
        date: toDateStr(s.schedule),
        backgroundColor: color.survey,
        borderColor: color.survey,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'survey',
          clientName: s.expand?.client?.company_name ?? '—',
          assignee: s.expand?.surveyor?.name,
          time: toTimeStr(s.schedule),
        },
      })
    }

    for (const p of prospects) {
      if (!p.meeting_schedule) continue
      result.push({
        id: `meeting-${p.id}`,
        title: p.client_name,
        date: toDateStr(p.meeting_schedule),
        backgroundColor: color.meeting,
        borderColor: color.meeting,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'meeting',
          clientName: p.client_name,
          time: toTimeStr(p.meeting_schedule),
        },
      })
    }

    return result
  }, [archProjects, civilProjects, interiorProjects, surveys, prospects])

  return { events, isLoading }
}
