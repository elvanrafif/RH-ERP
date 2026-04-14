import type { Project } from '@/types'
import { DONE_STATUSES } from '@/lib/constant'

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

/** Returns deadline status or null if not applicable.
 *  warningDays defaults to 7 — callers that need per-type threshold should pass it explicitly. */
export function classifyDeadline(
  daysRemaining: number,
  warningDays = 7
): DeadlineStatus | null {
  if (daysRemaining < 0) return 'overdue'
  if (daysRemaining <= warningDays) return 'warning'
  return null
}

/** Returns true if a project status is considered active (not done). */
export function isProjectActive(status: string): boolean {
  return !(DONE_STATUSES as readonly string[]).includes(status)
}

/** Resolves PIC name based on project type. Civil uses the vendor relation;
 *  architecture and interior use the assignee user relation. */
function getPicName(project: Project): string {
  if (project.type === 'civil') {
    return project.expand?.vendor?.name ?? '-'
  }
  return project.expand?.assignee?.name ?? '-'
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
      const deadlineStatus = classifyDeadline(daysRemaining) // uses default 7 — sidebar bell stays unchanged
      if (!deadlineStatus) return acc

      acc.push({
        id: project.id,
        clientName: project.expand?.client?.company_name ?? 'Unknown Client',
        picName: getPicName(project),
        type: project.type,
        daysRemaining,
        deadlineStatus,
      })
      return acc
    }, [])
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}
