import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'
import { DONE_STATUSES } from '@/lib/constant'
import { toDeadlineProjects } from '@/lib/projects/deadline'
import { useRole } from '@/hooks/useRole'

/** Fetches all active projects across all types for deadline notification. */
export function useDeadlineProjects() {
  const { isSuperAdmin, user } = useRole()

  const excludeFilter = DONE_STATUSES.map((s) => `status != '${s}'`).join(
    ' && '
  )

  const { data: projects = [] } = useQuery({
    queryKey: ['deadline-projects', isSuperAdmin, user?.id],
    queryFn: () =>
      pb.collection('projects').getFullList<Project>({
        filter: excludeFilter,
        expand: 'client,assignee',
      }),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  })

  const deadlineProjects = toDeadlineProjects(projects, user?.id, isSuperAdmin)

  return {
    deadlineProjects,
    overdueCount: deadlineProjects.filter((p) => p.deadlineStatus === 'overdue')
      .length,
    warningCount: deadlineProjects.filter((p) => p.deadlineStatus === 'warning')
      .length,
    totalCount: deadlineProjects.length,
  }
}
