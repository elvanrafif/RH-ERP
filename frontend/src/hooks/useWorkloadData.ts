import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildWorkloadData } from '@/lib/projects/statistics'
import type { WorkloadData } from '@/lib/projects/statistics'
import type { User } from '@/types'
import type { Project } from '@/types'

export function useWorkloadData() {
  return useQuery<WorkloadData>({
    queryKey: ['resource-workload-real'],
    queryFn: async () => {
      const [users, projects] = await Promise.all([
        pb.collection('users').getFullList<User>(),
        pb.collection('projects').getFullList<Project>({ filter: 'status != "finish"' }),
      ])
      return buildWorkloadData(users, projects)
    },
  })
}
