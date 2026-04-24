import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import type { Project } from '@/types'
import {
  DONE_STATUSES,
  PROJECT_STATUS,
  DEADLINE_WARNING_DAYS,
} from '@/lib/constant'
import {
  getProjectDeadlineDate,
  getDaysRemaining,
} from '@/lib/projects/deadline'

export interface MyProjectsData {
  projects: Project[]
  nearDeadlineCount: number
  inProgressCount: number
}

export function useMyProjects() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<MyProjectsData>({
    queryKey: ['my-projects', userId],
    enabled: !!userId,
    queryFn: async () => {
      const excludeFilter = DONE_STATUSES.map((s) => `status != '${s}'`).join(
        ' && '
      )
      const filter = `assignee = '${userId}' && ${excludeFilter}`

      const projects = await pb.collection('projects').getFullList<Project>({
        filter,
        expand: 'client',
        sort: 'deadline',
      })

      const nearDeadlineCount = projects.filter((p) => {
        const date = getProjectDeadlineDate(p)
        if (!date) return false
        const days = getDaysRemaining(date)
        const threshold = DEADLINE_WARNING_DAYS[p.type]
        return days >= 0 && days <= threshold
      }).length

      const inProgressCount = projects.filter(
        (p) => p.status === PROJECT_STATUS.PROGRESS
      ).length

      return { projects, nearDeadlineCount, inProgressCount }
    },
  })
}
