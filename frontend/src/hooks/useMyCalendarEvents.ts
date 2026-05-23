import { useMemo } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from './useProjects'
import { useProspects } from './useProspects'
import { CALENDAR_EVENT_COLORS, DIVISION, DONE_STATUSES } from '@/lib/constant'
import { formatClientName } from '@/components/shared/ClientName'
import type { CalendarEvent } from './useDashboardCalendarEvents'
import type { Survey } from '@/types'

function toDateStr(dateStr: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  return format(new Date(dateStr), 'yyyy-MM-dd')
}

function toTimeStr(dateStr: string): string | undefined {
  if (!dateStr || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined
  return format(new Date(dateStr), 'HH:mm')
}

const DIVISION_TO_PROJECT_TYPE: Record<
  string,
  'architecture' | 'civil' | 'interior'
> = {
  [DIVISION.ARCHITECTURE]: 'architecture',
  [DIVISION.CIVIL]: 'civil',
  [DIVISION.INTERIOR]: 'interior',
}

export function useMyCalendarEvents() {
  const { user } = useAuth()
  const userId = user?.id
  const projectType = user?.division
    ? DIVISION_TO_PROJECT_TYPE[user.division]
    : undefined

  const { projects: rawProjects, isLoading: projectsLoading } = useProjects({
    projectType: projectType ?? 'architecture',
    statusFilter: 'all',
  })
  // socmed has no project type — ignore fetched data
  const projects = projectType ? rawProjects : []

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys', 'my', userId],
    enabled: !!userId,
    queryFn: () =>
      pb.collection('surveys').getFullList<Survey>({
        filter: `surveyor = "${userId}"`,
        expand: 'client,surveyor',
        sort: '-schedule',
      }),
  })

  const { prospects, isLoading: prospectsLoading } = useProspects()

  const isLoading = projectsLoading || surveysLoading || prospectsLoading

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = []
    const color = CALENDAR_EVENT_COLORS

    for (const p of projects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status)) continue
      const dateField = projectType === 'civil' ? p.end_date : p.deadline
      if (!dateField) continue

      result.push({
        id: `${projectType}-${p.id}`,
        title: p.expand?.client
          ? formatClientName(p.expand.client)
          : projectType,
        date: toDateStr(dateField),
        backgroundColor: color[projectType],
        borderColor: color[projectType],
        textColor: '#ffffff',
        extendedProps: {
          eventType: projectType,
          clientName: p.expand?.client
            ? formatClientName(p.expand.client)
            : '—',
          assignee:
            projectType === 'civil'
              ? p.expand?.vendor?.name
              : p.expand?.assignee?.name,
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
          clientName: s.expand?.client
            ? formatClientName(s.expand.client)
            : '—',
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
  }, [projects, surveys, prospects, projectType])

  return { events, isLoading }
}
