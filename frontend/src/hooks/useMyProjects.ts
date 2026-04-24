import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import type { Project } from '@/types'

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
      const projects = await pb.collection('projects').getFullList<Project>({
        filter: `assignee = '${userId}' && status != 'done' && status != 'finish' && status != 'cancelled'`,
        expand: 'client',
        sort: 'deadline',
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const nearDeadlineCount = projects.filter((p) => {
        if (!p.deadline) return false
        const d = new Date(p.deadline)
        d.setHours(0, 0, 0, 0)
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 7
      }).length

      const inProgressCount = projects.filter(
        (p) => p.status === 'progress'
      ).length

      return { projects, nearDeadlineCount, inProgressCount }
    },
  })
}
