import { useMemo } from 'react'
import { useProjects } from './useProjects'
import { useProspects } from './useProspects'
import { useSurveys } from './useSurveys'
import { buildCalendarEvents } from '@/lib/calendar/buildCalendarEvents'

export type { CalendarEvent } from '@/lib/calendar/buildCalendarEvents'

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

  const events = useMemo(
    () => buildCalendarEvents(archProjects, civilProjects, interiorProjects, surveys, prospects),
    [archProjects, civilProjects, interiorProjects, surveys, prospects]
  )

  return { events, isLoading }
}
