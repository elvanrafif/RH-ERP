import type { Project } from '@/types'
import { DEADLINE_WARNING_DAYS, DONE_STATUSES } from '@/lib/constant'

export type DeadlineStatus = 'overdue' | 'warning'

export interface DeadlineProject {
  id: string
  clientName: string
  picName: string
  type: Project['type']
  daysRemaining: number
  deadlineStatus: DeadlineStatus
}

/** Picks the most relevant date field: deadline first, then end_date. */
export function getProjectDeadlineDate(project: Project): Date | null {
  const raw = project.deadline || project.end_date
  if (!raw) return null
  const date = new Date(raw)
  return isNaN(date.getTime()) ? null : date
}

/** Returns days remaining (negative = overdue). */
export function getDaysRemaining(deadlineDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(deadlineDate)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Returns deadline status or null if not applicable. */
export function classifyDeadline(daysRemaining: number): DeadlineStatus | null {
  if (daysRemaining < 0) return 'overdue'
  if (daysRemaining <= DEADLINE_WARNING_DAYS) return 'warning'
  return null
}

/** Returns true if a project status is considered active (not done). */
export function isProjectActive(status: string): boolean {
  return !(DONE_STATUSES as readonly string[]).includes(status)
}

/** Converts raw projects into a sorted list of deadline-relevant projects. */
export function toDeadlineProjects(
  projects: Project[],
  userId?: string,
  isSuperAdmin?: boolean
): DeadlineProject[] {
  const filtered = isSuperAdmin
    ? projects
    : projects.filter((p) => p.assignee === userId)

  return filtered
    .filter((p) => isProjectActive(p.status))
    .reduce<DeadlineProject[]>((acc, project) => {
      const date = getProjectDeadlineDate(project)
      if (!date) return acc

      const daysRemaining = getDaysRemaining(date)
      const deadlineStatus = classifyDeadline(daysRemaining)
      if (!deadlineStatus) return acc

      acc.push({
        id: project.id,
        clientName: project.expand?.client?.company_name ?? 'Unknown Client',
        picName: project.expand?.assignee?.name ?? '-',
        type: project.type,
        daysRemaining,
        deadlineStatus,
      })
      return acc
    }, [])
    .sort((a, b) => a.daysRemaining - b.daysRemaining) // overdue first
}
