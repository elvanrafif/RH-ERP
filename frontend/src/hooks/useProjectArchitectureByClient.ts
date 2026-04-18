import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

export function useProjectArchitectureByClient(clientId: string | undefined) {
  const { data: architectureProjects = [], isLoading } = useQuery({
    queryKey: ['projects-architecture-by-client', clientId],
    queryFn: () =>
      pb.collection('projects').getFullList<Project>({
        filter: `type = 'architecture' && client = '${clientId}'`,
        sort: '-created',
      }),
    enabled: !!clientId,
  })

  return {
    architectureProjects,
    hasArchitecture: architectureProjects.length > 0,
    isLoading,
  }
}
