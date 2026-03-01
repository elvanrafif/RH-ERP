import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildWorkloadData } from '@/lib/projects/statistics'
import type { WorkloadData } from '@/lib/projects/statistics'

export function useWorkloadData() {
  return useQuery<WorkloadData>({
    queryKey: ['resource-workload-real'],
    queryFn: async () => {
      const [users, projects] = await Promise.all([
        pb.collection('users').getFullList(),
        pb.collection('projects').getFullList({ filter: 'status != "finish"' }),
      ])
      return buildWorkloadData(users, projects)
    },
  })
}
