import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Prospect } from '@/types'

interface UseProspectsOptions {
  searchTerm?: string
}

export function useProspects({ searchTerm = '' }: UseProspectsOptions = {}) {
  const { data: prospects = [], isLoading } = useQuery({
    queryKey: ['prospects', searchTerm],
    queryFn: async () => {
      const filters: string[] = []

      if (searchTerm) {
        filters.push(
          `client_name ~ "${searchTerm}" || instagram ~ "${searchTerm}" || phone ~ "${searchTerm}"`
        )
      }

      return await pb.collection('prospects').getFullList<Prospect>({
        sort: '-created',
        filter: filters.join(' && '),
      })
    },
  })

  return { prospects, isLoading }
}
