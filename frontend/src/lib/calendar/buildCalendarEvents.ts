import { format } from 'date-fns'
import { CALENDAR_EVENT_COLORS, DONE_STATUSES } from '@/lib/constant'
import { formatClientName } from '@/components/shared/ClientName'
import type { Project, Survey, Prospect } from '@/types'

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

function toDateStr(dateStr: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  return format(new Date(dateStr), 'yyyy-MM-dd')
}

function toTimeStr(dateStr: string): string | undefined {
  if (!dateStr || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined
  return format(new Date(dateStr), 'HH:mm')
}

export function buildCalendarEvents(
  archProjects: Project[],
  civilProjects: Project[],
  interiorProjects: Project[],
  surveys: Survey[],
  prospects: Prospect[]
): CalendarEvent[] {
  const result: CalendarEvent[] = []
  const color = CALENDAR_EVENT_COLORS

  for (const p of archProjects) {
    if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline)
      continue
    result.push({
      id: `arch-${p.id}`,
      title: p.expand?.client ? formatClientName(p.expand.client) : 'Architecture',
      date: toDateStr(p.deadline),
      backgroundColor: color.architecture,
      borderColor: color.architecture,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'architecture',
        clientName: p.expand?.client ? formatClientName(p.expand.client) : '—',
        assignee: p.expand?.assignee?.name,
      },
    })
  }

  for (const p of civilProjects) {
    if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.end_date)
      continue
    result.push({
      id: `civil-${p.id}`,
      title: p.expand?.client ? formatClientName(p.expand.client) : 'Civil',
      date: toDateStr(p.end_date),
      backgroundColor: color.civil,
      borderColor: color.civil,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'civil',
        clientName: p.expand?.client ? formatClientName(p.expand.client) : '—',
        assignee: p.expand?.vendor?.name,
      },
    })
  }

  for (const p of interiorProjects) {
    if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline)
      continue
    result.push({
      id: `int-${p.id}`,
      title: p.expand?.client ? formatClientName(p.expand.client) : 'Interior',
      date: toDateStr(p.deadline),
      backgroundColor: color.interior,
      borderColor: color.interior,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'interior',
        clientName: p.expand?.client ? formatClientName(p.expand.client) : '—',
        assignee: p.expand?.assignee?.name,
      },
    })
  }

  for (const s of surveys) {
    if (!s.schedule) continue
    result.push({
      id: `survey-${s.id}`,
      title: s.expand?.client ? formatClientName(s.expand.client) : 'Survey',
      date: toDateStr(s.schedule),
      backgroundColor: color.survey,
      borderColor: color.survey,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'survey',
        clientName: s.expand?.client ? formatClientName(s.expand.client) : '—',
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
}
