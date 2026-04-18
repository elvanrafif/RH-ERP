import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

export function useProjectCivilByClient(clientId: string | undefined) {
  const { data: civilProjects = [], isLoading } = useQuery({
    queryKey: ['projects-civil-by-client', clientId],
    queryFn: () =>
      pb.collection('projects').getFullList<Project>({
        filter: `type = 'civil' && client = '${clientId}'`,
        sort: '-created',
      }),
    enabled: !!clientId,
  })

  return {
    civilProjects,
    hasCivil: civilProjects.length > 0,
    isLoading,
  }
}
