import type { Project } from '@/types'
import { CIVIL_STATUS_WARNING_DAYS } from '@/lib/constant'
import { getDaysRemaining } from '@/lib/projects/deadline'

export type CivilProjectStatus =
  | 'on_progress'
  | 'deadline_warning'
  | 'overdue'
  | 'finish'

export interface CivilStatusConfig {
  label: string
  colorClass: string
}

const CIVIL_STATUS_CONFIG: Record<CivilProjectStatus, CivilStatusConfig> = {
  finish: {
    label: 'Finished',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  on_progress: {
    label: 'On Progress',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  deadline_warning: {
    label: 'Deadline Soon',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  overdue: {
    label: 'Overdue',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
  },
}

export function getCivilProjectStatus(project: Project): CivilProjectStatus {
  if (project.status === 'finish') return 'finish'
  if (!project.end_date) return 'on_progress'

  const daysLeft = getDaysRemaining(new Date(project.end_date))
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= CIVIL_STATUS_WARNING_DAYS) return 'deadline_warning'
  return 'on_progress'
}

export function getCivilStatusConfig(
  status: CivilProjectStatus
): CivilStatusConfig {
  return CIVIL_STATUS_CONFIG[status]
}
